'use server'

import { db, apiKeys, eq, and } from '@/lib/db';
import { encrypt } from 'database';

export async function saveApiKeys(userId: number, exchange: string, apiKey: string, apiSecret: string) {
    if (!apiKey || !apiSecret) return;
    
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    
    const existing = await db.select().from(apiKeys).where(
        and(eq(apiKeys.userId, userId), eq(apiKeys.exchange, exchange))
    ).execute();

    if (existing.length > 0) {
        await db.update(apiKeys)
            .set({ apiKey: encryptedKey, apiSecret: encryptedSecret })
            .where(eq(apiKeys.id, existing[0].id))
            .execute();
    } else {
        await db.insert(apiKeys).values({
            userId,
            exchange,
            apiKey: encryptedKey,
            apiSecret: encryptedSecret,
        }).execute();
    }
}
