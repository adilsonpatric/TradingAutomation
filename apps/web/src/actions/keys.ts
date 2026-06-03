'use server'

import { db, apiKeys, eq, and } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { encrypt } from 'database';
import { revalidatePath } from 'next/cache';

export async function addApiKey(name: string, exchange: string, apiKey: string, apiSecret: string) {
    const user = await requireUser();
    if (!name || !apiKey || !apiSecret) throw new Error("Missing fields");
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    await db.insert(apiKeys).values({
        userId: user.id,
        name,
        exchange,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
    }).execute();
    revalidatePath('/settings');
    revalidatePath('/bots');
    revalidatePath('/');
}

export async function deleteApiKey(keyId: number) {
    const user = await requireUser();
    await db.delete(apiKeys).where(
        and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.id))
    ).execute();
    revalidatePath('/settings');
    revalidatePath('/bots');
    revalidatePath('/');
}

export async function getApiKeys() {
    const user = await requireUser();
    const keys = await db.select({
        id: apiKeys.id,
        name: apiKeys.name,
        exchange: apiKeys.exchange,
        apiKey: apiKeys.apiKey,
        apiSecret: apiKeys.apiSecret
    }).from(apiKeys).where(eq(apiKeys.userId, user.id)).execute();
    return keys;
}
