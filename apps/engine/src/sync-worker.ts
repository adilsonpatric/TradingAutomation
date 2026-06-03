import { db, users, bots, trades, apiKeys, eq } from './db/sqlite-client';
import { and, or, isNotNull, desc } from 'drizzle-orm';
import ccxt from 'ccxt';
import { decrypt } from 'database';
import { Telegraf } from 'telegraf';

function getExchangeInstance(exchangeId: string, marketType: string) {
    if (exchangeId === 'binance' && marketType === 'futures') {
        return 'binanceusdm';
    }
    return exchangeId;
}

export async function syncPositions() {
    console.log('[SYNC] Starting periodic sync with exchanges...');
    
    try {
        // Find open trades that have TP or SL orders
        const openTrades = await db.select()
            .from(trades)
            .where(
                and(
                    eq(trades.status, 'open'),
                    or(isNotNull(trades.tpOrderId), isNotNull(trades.slOrderId))
                )
            ).execute();

        if (openTrades.length === 0) {
            console.log('[SYNC] No open trades with conditional orders to sync.');
            return { success: true, synced: 0 };
        }

        let syncedCount = 0;

        for (const trade of openTrades) {
            // Get the bot
            const botRecords = await db.select().from(bots).where(eq(bots.id, trade.botId!)).execute();
            if (botRecords.length === 0) continue;
            const bot = botRecords[0];

            // Get API Keys
            const keyRecords = await db.select().from(apiKeys).where(eq(apiKeys.id, bot.apiKeyId!)).execute();
            if (keyRecords.length === 0) continue;
            const exchangeKeys = keyRecords[0];

            const apiKey = decrypt(exchangeKeys.apiKey);
            const secret = decrypt(exchangeKeys.apiSecret);

            const ccxtExchangeId = getExchangeInstance(bot.exchange, bot.marketType);
            
            // @ts-ignore
            const exchangeClass = ccxt[ccxtExchangeId];
            if (!exchangeClass) continue;

            const exchange = new (exchangeClass as any)({
                apiKey: apiKey,
                secret: secret,
                enableRateLimit: true,
                options: { defaultType: bot.marketType }
            });

            let closedOrder: ccxt.Order | null = null;
            let hitType = '';

            try {
                if (trade.tpOrderId) {
                    const tpOrder = await exchange.fetchOrder(trade.tpOrderId, trade.symbol);
                    if (tpOrder.status === 'closed') {
                        closedOrder = tpOrder;
                        hitType = 'Take Profit';
                    }
                }

                if (!closedOrder && trade.slOrderId) {
                    const slOrder = await exchange.fetchOrder(trade.slOrderId, trade.symbol);
                    if (slOrder.status === 'closed') {
                        closedOrder = slOrder;
                        hitType = 'Stop Loss';
                    }
                }
            } catch (err: any) {
                console.error(`[SYNC] Error fetching orders for trade ${trade.id}: ${err.message}`);
                continue;
            }

            if (closedOrder) {
                const fillPrice = closedOrder.average || closedOrder.price || 0;
                
                // Calculate PnL
                // If trade.side is 'buy', then we went long. TP/SL would be 'sell'. PnL = (fillPrice - entryPrice) * amount
                // If trade.side is 'sell', then we went short. TP/SL would be 'buy'. PnL = (entryPrice - fillPrice) * amount
                let pnl = 0;
                if (trade.side === 'buy') {
                    pnl = (fillPrice - trade.price) * trade.amount;
                } else {
                    pnl = (trade.price - fillPrice) * trade.amount;
                }

                // Send to StockIQ via API
                let portaiqSyncedOk = false;
                const userRecords = await db.select().from(users).where(eq(users.id, bot.userId)).execute();
                const user = userRecords[0];

                if (user && user.portaiqApiKey) {
                    try {
                        let entryDateStr = new Date().toISOString();
                        if (trade.timestamp) {
                            let time = trade.timestamp.getTime();
                            if (time > 20000000000000) {
                                time = Math.floor(time / 1000);
                            }
                            entryDateStr = new Date(time).toISOString();
                        }

                        const stockIqPayload = {
                            symbol: trade.symbol.replace('/', ''),
                            asset_type: "crypto",
                            type: trade.side === 'buy' ? 'long' : 'short',
                            status: 'closed',
                            quantity: trade.amount,
                            entry_price: trade.price,
                            exit_price: fillPrice,
                            stop_loss: bot.slPercent ? (trade.side === 'buy' ? trade.price * (1 - bot.slPercent/100) : trade.price * (1 + bot.slPercent/100)) : undefined,
                            take_profit: bot.tpPercent ? (trade.side === 'buy' ? trade.price * (1 + bot.tpPercent/100) : trade.price * (1 - bot.tpPercent/100)) : undefined,
                            commissions: 0,
                            entry_date: entryDateStr,
                            exit_date: new Date().toISOString(),
                            notes: `Trade closed by ${hitType} via Trading Automation Bot (${bot.name}).`
                        };

                        const portaiqUrl = user.portaiqUrl || 'http://localhost:3001/api/journal/trades';
                        const response = await fetch(portaiqUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.portaiqApiKey}`
                            },
                            body: JSON.stringify(stockIqPayload)
                        });

                        if (!response.ok) {
                            console.error(`[Background Sync] Failed to export trade ${trade.id} to PortaIQ:`, await response.text());
                        } else {
                            portaiqSyncedOk = true;
                            console.log(`[SYNC] Successfully sent trade to StockIQ Journal (Bot: ${bot.name}).`);
                        }
                    } catch (e) {
                        console.error('[SYNC] Failed to send trade to StockIQ', e);
                    }
                }

                await db.update(trades)
                    .set({ 
                        status: 'closed', 
                        pnl: pnl,
                        portaiqSynced: portaiqSyncedOk
                    })
                    .where(eq(trades.id, trade.id))
                    .execute();
                    
                syncedCount++;
                console.log(`[SYNC] Trade ${trade.id} closed via ${hitType}. PnL: $${pnl.toFixed(2)}`);

                // Send Telegram Notification
                if (user && user.telegramBotToken && user.telegramChatId && user.notifyTpSl) {
                    try {
                        const telegrafBot = new Telegraf(user.telegramBotToken);
                        const emoji = pnl >= 0 ? '✅' : '🛑';
                        await telegrafBot.telegram.sendMessage(
                            user.telegramChatId, 
                            `${emoji} <b>${hitType} Hit!</b>\n\nBot: ${bot.name}\nPair: ${trade.symbol}\nClosed Price: $${fillPrice.toFixed(4)}\nPnL: $${pnl.toFixed(2)}`,
                            { parse_mode: 'HTML' }
                        );
                    } catch (e) {
                        console.error('[SYNC] Failed to send telegram message', e);
                    }
                }
            }
        }
        
        console.log(`[SYNC] Sync complete. Closed ${syncedCount} trades.`);
        return { success: true, synced: syncedCount };

    } catch (error: any) {
        console.error('[SYNC] Fatal error during sync:', error.message);
        return { success: false, error: error.message };
    }
}
