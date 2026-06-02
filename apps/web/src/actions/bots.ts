'use server'

import { db, bots } from '@/lib/db';

export async function getBots() {
    return await db.select().from(bots).execute();
}

export async function createBot(
    userId: number, 
    name: string, 
    exchange: string, 
    apiKeyId: number,
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
        apiKeyId,
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

import { eq } from 'drizzle-orm';

export async function updateBot(
    botId: number, 
    name: string, 
    exchange: string, 
    apiKeyId: number,
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
    await db.update(bots).set({
        name,
        exchange,
        apiKeyId,
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
    }).where(eq(bots.id, botId)).execute();
}

export async function toggleBotStatus(botId: number, currentStatus: boolean) {
    await db.update(bots).set({ isRunning: !currentStatus }).where(eq(bots.id, botId)).execute();
}

export async function deleteBot(botId: number) {
    await db.delete(bots).where(eq(bots.id, botId)).execute();
}
