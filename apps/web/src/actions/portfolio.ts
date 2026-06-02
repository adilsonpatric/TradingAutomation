'use server'

import ccxt from 'ccxt';
import { db, apiKeys, eq } from '@/lib/db';
import { decrypt } from 'database';

export async function getCompletePortfolio(userId: number) {
    const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).execute();
    
    let totalUsd = 0;
    const assetsMap = new Map<string, { balance: number, usdValue: number }>();

    const subaccounts: { id: number, name: string, exchange: string, totalUsd: number }[] = [];

    for (const key of keys) {
        let keyTotalUsd = 0;
        try {
            const exchangeClass = ccxt[key.exchange as keyof typeof ccxt];
            if (!exchangeClass) continue;

            const decryptedKey = decrypt(key.apiKey);
            const decryptedSecret = decrypt(key.apiSecret);

            const exchange = new (exchangeClass as any)({
                apiKey: decryptedKey,
                secret: decryptedSecret,
                enableRateLimit: true,
                options: {
                    adjustForTimeDifference: true,
                    recvWindow: 10000
                }
            });

            const balancesList: any[] = [];
            
            // Explicitly load time difference to prevent Bybit timestamp errors
            if (exchange.has['fetchTime']) {
                await exchange.loadTimeDifference();
            }

            // For Bybit, funds could be scattered across different wallet types depending on account upgrades
            if (key.exchange === 'bybit') {
                for (const type of ['unified', 'spot', 'contract', 'fund']) {
                    try {
                        const bal = await exchange.fetchBalance({ type });
                        balancesList.push({ requestedType: type, bal });
                    } catch (e: any) {
                        balancesList.push({ requestedType: type, error: e.message });
                    }
                }
            } else {
                try {
                    balancesList.push({ requestedType: 'default', bal: await exchange.fetchBalance() });
                } catch (e: any) {
                    balancesList.push({ requestedType: 'default', error: e.message });
                }
            }

            const tickers = await exchange.fetchTickers();

            // Merge all balances
            const seenAccountTypes = new Set<string>();
            
            for (const item of balancesList) {
                const balances = item.bal;
                if (!balances || !balances.total) continue;
                
                // Deduplicate Bybit responses (UTA returns 'UNIFIED' for spot, contract, and unified queries)
                if (key.exchange === 'bybit' && balances.info?.result?.list?.[0]?.accountType) {
                    const accountType = balances.info.result.list[0].accountType;
                    if (seenAccountTypes.has(accountType)) continue;
                    seenAccountTypes.add(accountType);
                }

                for (const asset in balances.total) {
                const amount = balances.total[asset];
                if (amount > 0) {
                    let usdValue = 0;
                    if (asset === 'USDT' || asset === 'USDC' || asset === 'USD') {
                        usdValue = amount;
                    } else if (tickers[`${asset}/USDT`]) {
                        usdValue = amount * (tickers[`${asset}/USDT`].last || 0);
                    } else if (tickers[`${asset}/USD`]) {
                        usdValue = amount * (tickers[`${asset}/USD`].last || 0);
                    }

                    if (usdValue > 0.01) { // Ignore dust < 1 cent
                        keyTotalUsd += usdValue;
                        totalUsd += usdValue;
                        const existing = assetsMap.get(asset) || { balance: 0, usdValue: 0 };
                        assetsMap.set(asset, {
                            balance: existing.balance + amount,
                            usdValue: existing.usdValue + usdValue
                        });
                    }
                }
                }
            }
        } catch (e) {
            console.error(`Failed to fetch complete portfolio for ${key.exchange}`, e);
        }

        subaccounts.push({
            id: key.id,
            name: key.name,
            exchange: key.exchange,
            totalUsd: keyTotalUsd
        });
    }

    const assets = Array.from(assetsMap.entries())
        .map(([asset, data]) => ({
            asset,
            balance: data.balance,
            usdValue: data.usdValue
        }))
        .sort((a, b) => b.usdValue - a.usdValue);

    return { totalUsd, assets, subaccounts };
}
