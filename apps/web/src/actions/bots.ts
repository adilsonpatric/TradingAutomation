'use server'

import { db, bots } from '@/lib/db';

export async function getBots() {
    return await db.select().from(bots).execute();
}

export async function createBot(
    userId: number, 
    name: string, 
    exchange: string, 
    pair: string, 
    marketType: string,
    isPaperTrading: boolean,
    leverage: number,
    orderType: string,
    sizeType: string,
    tradeSizePercent: number,
    cooldownSeconds: number,
    slPercent: number | null,
    tpPercent: number | null
) {
    const result = await db.insert(bots).values({
        userId,
        name,
        exchange,
        pair,
        marketType,
        isPaperTrading,
        leverage,
        orderType,
        sizeType,
        tradeSizePercent,
        cooldownSeconds,
        slPercent,
        tpPercent,
        isRunning: true,
    }).returning({ id: bots.id }).execute();
    
    return result[0];
}
