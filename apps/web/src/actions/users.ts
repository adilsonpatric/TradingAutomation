'use server'

import { db, users, eq } from '@/lib/db';
import crypto from 'crypto';

export async function getUserPreferences(userId: number) {
    let userRecord = await db.select().from(users).where(eq(users.id, userId)).execute();
    
    // Auto-create default user if the DB is completely fresh
    if (userRecord.length === 0) {
        const defaultSecret = crypto.randomBytes(16).toString('hex');
        await db.insert(users).values({
            id: userId,
            webhookSecret: defaultSecret,
            telegramBotToken: '',
            telegramChatId: '',
            webhookDomain: 'http://localhost:4000'
        }).execute();
        
        userRecord = await db.select().from(users).where(eq(users.id, userId)).execute();
    }
    
    return userRecord[0];
}

export async function updateUserPreferences(
    userId: number, 
    webhookSecret: string, 
    telegramBotToken: string, 
    telegramChatId: string, 
    webhookDomain: string,
    syncIntervalMinutes?: number,
    notifyTradeEntry?: boolean,
    notifyTradeClose?: boolean,
    notifyTpSl?: boolean,
    portaiqApiKey?: string
) {
    await db.update(users).set({
        webhookSecret,
        telegramBotToken,
        telegramChatId,
        webhookDomain,
        syncIntervalMinutes,
        notifyTradeEntry,
        notifyTradeClose,
        notifyTpSl,
        portaiqApiKey
    }).where(eq(users.id, userId)).execute();
}
