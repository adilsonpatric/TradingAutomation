'use server'

import { db, apiKeys, eq, and } from '@/lib/db';
import { encrypt } from 'database';
import { revalidatePath } from 'next/cache';

export async function addApiKey(userId: number, name: string, exchange: string, apiKey: string, apiSecret: string) {
    if (!name || !apiKey || !apiSecret) throw new Error("Missing fields");
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    await db.insert(apiKeys).values({
        userId,
        name,
        exchange,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
    }).execute();
    revalidatePath('/settings');
    revalidatePath('/bots');
    revalidatePath('/');
}

export async function deleteApiKey(userId: number, keyId: number) {
    await db.delete(apiKeys).where(
        and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId))
    ).execute();
    revalidatePath('/settings');
    revalidatePath('/bots');
    revalidatePath('/');
}

export async function getApiKeys(userId: number) {
    const keys = await db.select({
        id: apiKeys.id,
        name: apiKeys.name,
        exchange: apiKeys.exchange,
        apiKey: apiKeys.apiKey,
        apiSecret: apiKeys.apiSecret
    }).from(apiKeys).where(eq(apiKeys.userId, userId)).execute();
    return keys;
}
