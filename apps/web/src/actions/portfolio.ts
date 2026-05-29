'use server'

import ccxt from 'ccxt';
import { db, apiKeys, eq } from '@/lib/db';
import { decrypt } from 'database';

export async function getPortfolioBalance(userId: number) {
    const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).execute();
    
    let totalUsd = 0;

    for (const key of keys) {
        try {
            const exchangeClass = ccxt[key.exchange as keyof typeof ccxt];
            if (!exchangeClass) continue;

            const decryptedKey = decrypt(key.apiKey);
            const decryptedSecret = decrypt(key.apiSecret);

            const exchange = new (exchangeClass as any)({
                apiKey: decryptedKey,
                secret: decryptedSecret,
                enableRateLimit: true,
            });

            const balance = await exchange.fetchBalance();
            // For prototype simplicity, we assume the portfolio value is the total USDT balance.
            // In a full version, we'd iterate over all non-zero assets and fetch current tickers.
            const usdtBalance = balance.USDT?.total || 0;
            totalUsd += usdtBalance;
        } catch (e) {
            console.error(`Failed to fetch balance for ${key.exchange}`, e);
        }
    }

    return totalUsd;
}
