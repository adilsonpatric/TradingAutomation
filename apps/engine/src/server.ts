import express from 'express';
import cors from 'cors';
import { db, users, bots, trades, eq } from './db/sqlite-client';
import { and, desc } from 'drizzle-orm';
import { executeTrade } from './exchange/ccxt-client';
import { Telegraf } from 'telegraf';
import { syncPositions } from './sync-worker';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
    if (botToken && chatId) {
        try {
            const telegrafBot = new Telegraf(botToken);
            await telegrafBot.telegram.sendMessage(chatId, message);
        } catch (e) {
            console.error('Failed to send telegram message', e);
        }
    }
}

app.post('/webhook', async (req, res) => {
    try {
        const { secret, botId, side, amount, price } = req.body;

        if (!secret || !botId || !side || !amount) {
            return res.status(400).json({ error: 'Missing required payload fields' });
        }

        // Validate secret
        const botRecord = await db.select().from(bots).where(eq(bots.id, botId)).execute();
        if (botRecord.length === 0) {
            return res.status(404).json({ error: 'Bot not found' });
        }
        
        const bot = botRecord[0];
        
        if (!bot.isRunning) {
            return res.status(400).json({ error: 'Bot is disabled' });
        }

        const userRecord = await db.select().from(users).where(eq(users.id, bot.userId)).execute();
        if (userRecord.length === 0 || userRecord[0].webhookSecret !== secret) {
            return res.status(401).json({ error: 'Unauthorized webhook' });
        }

        // Debounce Cooldown Check
        if (bot.cooldownSeconds > 0) {
            const now = new Date();
            if (bot.lastExecutedAt) {
                const diffSecs = (now.getTime() - new Date(bot.lastExecutedAt).getTime()) / 1000;
                if (diffSecs < bot.cooldownSeconds) {
                    console.log(`[DEBOUNCE] Rejected signal for bot ${bot.name} (Cooldown active)`);
                    return res.status(429).json({ error: `Cooldown active. Wait ${Math.ceil(bot.cooldownSeconds - diffSecs)}s` });
                }
            }
            await db.update(bots).set({ lastExecutedAt: now }).where(eq(bots.id, bot.id)).execute();
        }

        // Execute trade
        const order = await executeTrade(bot, side, amount, price);
        const fillPrice = order.average || order.price || (price ? parseFloat(price) : 0);
        const tradeAmount = parseFloat(amount);

        let tradeStatus = 'open';
        let tradePnl: number | null = null;

        // Check for an existing open trade to close
        const openTrades = await db.select()
            .from(trades)
            .where(and(eq(trades.botId, bot.id), eq(trades.status, 'open')))
            .orderBy(desc(trades.timestamp))
            .limit(1)
            .execute();

        const lastTrade = openTrades[0];

        if (lastTrade && lastTrade.side !== side) {
            // It's a closing trade
            tradeStatus = 'closed';
            if (lastTrade.side === 'buy' && side === 'sell') {
                tradePnl = (fillPrice - lastTrade.price) * tradeAmount;
            } else if (lastTrade.side === 'sell' && side === 'buy') {
                tradePnl = (lastTrade.price - fillPrice) * tradeAmount;
            }

            // Close the previous trade
            await db.update(trades)
                .set({ status: 'closed' })
                .where(eq(trades.id, lastTrade.id))
                .execute();
        }

        // Log trade
        await db.insert(trades).values({
            botId: bot.id,
            symbol: bot.pair,
            side: side,
            price: fillPrice,
            amount: tradeAmount,
            status: tradeStatus,
            pnl: tradePnl,
            exchangeOrderId: order.id,
            tpOrderId: order.tpOrderId,
            slOrderId: order.slOrderId
        }).execute();

        // Send Telegram notification
        const user = userRecord[0];
        if (user && user.telegramBotToken && user.telegramChatId && user.notifyTradeEntry) {
            const paperPrefix = bot.isPaperTrading ? '🧪 [PAPER TRADE] ' : '🚀 ';
            await sendTelegramMessage(
                user.telegramBotToken, 
                user.telegramChatId, 
                `${paperPrefix}Executed ${bot.orderType} ${side} order for ${bot.pair} on ${bot.exchange}`
            );
        }

        console.log(`${bot.isPaperTrading ? '[PAPER] ' : ''}Executed ${side} order for ${bot.pair} on ${bot.exchange}`);
        res.status(200).json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sync', async (req, res) => {
    try {
        const result = await syncPositions();
        res.status(200).json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

const scheduleNextSync = async () => {
    try {
        const userRecords = await db.select().from(users).execute();
        const user = userRecords[0];
        const intervalMinutes = user?.syncIntervalMinutes || 10;
        
        setTimeout(async () => {
            try {
                await syncPositions();
            } catch (err) {
                console.error('Sync Worker Error:', err);
            } finally {
                scheduleNextSync();
            }
        }, intervalMinutes * 60 * 1000);
    } catch (err) {
        console.error('Failed to schedule next sync:', err);
        setTimeout(scheduleNextSync, 60000);
    }
};

app.listen(PORT, () => {
    console.log(`Execution Engine running on port ${PORT}`);
    
    // Start background sync with dynamic interval
    scheduleNextSync();
});
