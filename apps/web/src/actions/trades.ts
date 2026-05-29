'use server'

import { db, trades, bots, desc, eq } from '@/lib/db';

export async function getRecentTrades() {
    // We join trades with bots to get the exchange name
    const recentTrades = await db.select({
        id: trades.id,
        symbol: trades.symbol,
        side: trades.side,
        price: trades.price,
        amount: trades.amount,
        timestamp: trades.timestamp,
        exchange: bots.exchange,
    })
    .from(trades)
    .leftJoin(bots, eq(trades.botId, bots.id))
    .orderBy(desc(trades.timestamp))
    .limit(10)
    .execute();

    return recentTrades;
}
