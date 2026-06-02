'use server'

import ccxt from 'ccxt';
import { db, apiKeys, eq, and } from '@/lib/db';
import { decrypt } from 'database';

// Helper to instantiate CCXT from DB
async function getExchangeInstance(userId: number, apiKeyId: number) {
    const keys = await db.select().from(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, apiKeyId))).execute();
    
    if (keys.length === 0) return null;
    const key = keys[0];

    const exchangeClass = ccxt[key.exchange as keyof typeof ccxt];
    if (!exchangeClass) return null;

    const decryptedKey = decrypt(key.apiKey);
    const decryptedSecret = decrypt(key.apiSecret);

    return {
        exchange: new (exchangeClass as any)({
            apiKey: decryptedKey,
            secret: decryptedSecret,
            enableRateLimit: true,
            options: { 
                defaultType: 'spot',
                adjustForTimeDifference: true, 
                recvWindow: 10000
            }
        }),
        apiKeyPreview: decryptedKey.substring(0, 4) + '...' + decryptedKey.substring(decryptedKey.length - 4),
        apiSecretPreview: decryptedSecret.substring(0, 4) + '...' + decryptedSecret.substring(decryptedSecret.length - 4),
        exchangeId: key.exchange
    };
}

export async function getExchangeConnectionInfo(userId: number, apiKeyId: number) {
    const instance = await getExchangeInstance(userId, apiKeyId);
    if (!instance) return { isConnected: false, apiKeyPreview: '', apiSecretPreview: '' };
    return { isConnected: true, apiKeyPreview: instance.apiKeyPreview, apiSecretPreview: instance.apiSecretPreview };
}

export async function testExchangeConnection(exchangeId: string, apiKey: string, apiSecret: string) {
    try {
        const exchangeClass = ccxt[exchangeId as keyof typeof ccxt];
        if (!exchangeClass) return { success: false, message: 'Invalid exchange' };

        const exchange = new (exchangeClass as any)({
            apiKey: apiKey,
            secret: apiSecret,
            enableRateLimit: true,
            options: { 
                defaultType: 'spot',
                adjustForTimeDifference: true,
                recvWindow: 10000
            }
        });

        if (exchange.has['fetchTime']) {
            await exchange.loadTimeDifference();
        }

        await exchange.fetchBalance();
        
        let expiresAt = null;
        try {
            if (exchangeId === 'bybit' && typeof (exchange as any).privateGetV5UserQueryApi === 'function') {
                const apiInfo = await (exchange as any).privateGetV5UserQueryApi();
                if (apiInfo?.result?.expiredAt) {
                    expiresAt = new Date(apiInfo.result.expiredAt).toLocaleDateString();
                } else if (apiInfo?.result) {
                    expiresAt = "Permanent";
                }
            } else if (exchangeId === 'binance' && typeof (exchange as any).sapiGetV1AccountApiRestrictions === 'function') {
                const apiInfo = await (exchange as any).sapiGetV1AccountApiRestrictions();
                if (apiInfo?.tradingAuthorityExpirationTime) {
                    expiresAt = new Date(apiInfo.tradingAuthorityExpirationTime).toLocaleDateString();
                } else if (apiInfo) {
                    expiresAt = "Permanent";
                }
            }
        } catch (e) {
            console.warn(`Could not fetch expiration date for ${exchangeId}`, e);
        }

        return { success: true, message: 'Connection successful!', expiresAt };
    } catch (error: any) {
        console.error('Test connection failed:', error.message);
        return { success: false, message: error.message || 'Authentication failed' };
    }
}

export async function getExchangeMarkets(userId: number, apiKeyId: number, marketType: string) {
    try {
        const instance = await getExchangeInstance(userId, apiKeyId);
        if (!instance) return [];

        if (instance.exchange.has['fetchTime']) {
            await instance.exchange.loadTimeDifference();
        }

        const markets = await instance.exchange.loadMarkets();
        const validSymbols = [];

        for (const symbol in markets) {
            const market = markets[symbol];
            if (marketType === 'spot' && market.spot && market.active) {
                validSymbols.push(symbol);
            } else if (marketType === 'futures' && market.swap && market.active) {
                validSymbols.push(symbol);
            }
        }
        
        return validSymbols.sort();
    } catch (error) {
        console.error('Failed to load markets:', error);
        return [];
    }
}

export async function getPairBalance(userId: number, apiKeyId: number, pair: string) {
    try {
        const instance = await getExchangeInstance(userId, apiKeyId);
        if (!instance) return { base: 0, quote: 0 };

        const [baseAsset, quoteAssetRaw] = pair.split('/');
        const quoteAsset = quoteAssetRaw ? quoteAssetRaw.split(':')[0] : '';
        let baseFree = 0;
        let quoteFree = 0;

        if (instance.exchange.has['fetchTime']) {
            await instance.exchange.loadTimeDifference();
        }

        let balances;
        if (instance.exchangeId === 'bybit') {
            try {
                balances = await instance.exchange.fetchBalance({ type: 'unified' });
            } catch (e) {
                balances = await instance.exchange.fetchBalance({ type: 'spot' });
            }
        } else {
            balances = await instance.exchange.fetchBalance();
        }

        if (balances && balances[baseAsset]) baseFree = (balances[baseAsset].free || 0);
        if (balances && balances[quoteAsset]) quoteFree = (balances[quoteAsset].free || 0);

        return {
            base: baseFree,
            quote: quoteFree
        };
    } catch (error) {
        console.error('Failed to load pair balance:', error);
        return { base: 0, quote: 0 };
    }
}
