'use server'

import { db, bots } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function getBots() {
    const user = await requireUser();
    return await db.select().from(bots).where(eq(bots.userId, user.id)).execute();
}

export async function createBot(
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
    const user = await requireUser();
    const result = await db.insert(bots).values({
        userId: user.id,
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
    const user = await requireUser();
    // Verify bot ownership
    const bot = await db.select().from(bots).where(and(eq(bots.id, botId), eq(bots.userId, user.id))).execute();
    if (!bot.length) throw new Error("Unauthorized");

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
    const user = await requireUser();
    const bot = await db.select().from(bots).where(and(eq(bots.id, botId), eq(bots.userId, user.id))).execute();
    if (!bot.length) throw new Error("Unauthorized");

    await db.update(bots).set({ isRunning: !currentStatus }).where(eq(bots.id, botId)).execute();
}

export async function deleteBot(botId: number) {
    const user = await requireUser();
    const bot = await db.select().from(bots).where(and(eq(bots.id, botId), eq(bots.userId, user.id))).execute();
    if (!bot.length) throw new Error("Unauthorized");

    await db.delete(bots).where(eq(bots.id, botId)).execute();
}
