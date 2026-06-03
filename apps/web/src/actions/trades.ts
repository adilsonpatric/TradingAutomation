'use server'

import { db, trades, bots, users, desc, eq } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getRecentTrades() {
    const data = await db
        .select({
            id: trades.id,
            botName: bots.name,
            symbol: trades.symbol,
            side: trades.side,
            price: trades.price,
            amount: trades.amount,
            timestamp: trades.timestamp,
            isPaperTrading: bots.isPaperTrading,
            status: trades.status,
            pnl: trades.pnl,
            portaiqSynced: trades.portaiqSynced,
        })
        .from(trades)
        .leftJoin(bots, eq(trades.botId, bots.id))
        .orderBy(desc(trades.timestamp))
        .limit(100)
        .execute();
        
    return data;
}

export async function deleteTrade(id: number) {
    await db.delete(trades).where(eq(trades.id, id)).execute();
    revalidatePath('/activity');
}

export async function exportTradeToPortaIQ(tradeId: number) {
    // Buscamos o trade no banco de dados por segurança, para não depender de dados do client-side
    const tradeData = await db.select().from(trades).where(eq(trades.id, tradeId)).execute();
    
    if (!tradeData.length) {
        throw new Error("Trade not found");
    }
    
    console.log("[PortaIQ Integration] Exporting trade:", tradeData[0]);
    
    // We get user preferences to find the API key
    const userData = await db.select().from(users).where(eq(users.id, 1)).execute();
    const user = userData[0];

    if (!user || !user.portaiqApiKey) {
        throw new Error("PortaIQ API Key not configured in Settings");
    }

    const portaiqApiKey = user.portaiqApiKey;
    const portaiqUrl = user.portaiqUrl || 'http://localhost:3001/api/journal/trades';
    
    const trade = tradeData[0];
    const botData = await db.select().from(bots).where(eq(bots.id, trade.botId!)).execute();
    const bot = botData[0];

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
            status: trade.status === 'open' ? 'open' : 'closed',
            quantity: trade.amount,
            entry_price: trade.price,
            exit_price: trade.status === 'closed' ? (trade.pnl !== null ? (trade.side === 'buy' ? trade.price + (trade.pnl / trade.amount) : trade.price - (trade.pnl / trade.amount)) : undefined) : undefined,
            stop_loss: bot?.slPercent ? (trade.side === 'buy' ? trade.price * (1 - bot.slPercent/100) : trade.price * (1 + bot.slPercent/100)) : undefined,
            take_profit: bot?.tpPercent ? (trade.side === 'buy' ? trade.price * (1 + bot.tpPercent/100) : trade.price * (1 - bot.tpPercent/100)) : undefined,
            commissions: 0, // Since we don't store it on this level
            entry_date: entryDateStr,
            exit_date: trade.status === 'closed' ? new Date().toISOString() : undefined,
            notes: `Manually exported from Trading Automation Bot (${bot?.name || 'Unknown'}).`
        };

    const response = await fetch(portaiqUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${portaiqApiKey}`
        },
        body: JSON.stringify(stockIqPayload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("[PortaIQ Integration] Failed:", errorData);
        throw new Error(errorData.error || "Failed to export to PortaIQ");
    }
    
    // Mark as synced
    await db.update(trades).set({ portaiqSynced: true }).where(eq(trades.id, tradeId)).execute();

    revalidatePath('/activity');

    return { success: true, message: "Exported successfully" };
}
