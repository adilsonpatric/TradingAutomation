import ccxt from 'ccxt';
import { db, apiKeys, eq } from '../db/sqlite-client';
import { decrypt } from 'database';

function getExchangeInstance(exchangeId: string, marketType: string) {
    if (exchangeId === 'binance' && marketType === 'futures') {
        return 'binanceusdm'; // Binance Futures
    }
    return exchangeId;
}

export async function executeTrade(bot: any, side: string, webhookAmountOrPercentage: string, webhookPrice?: string) {
    // 1. Paper Trading Fast-Path
    if (bot.isPaperTrading) {
        console.log(`[PAPER TRADE] Simulated ${side} order for ${bot.pair}`);
        return {
            id: `paper_${Date.now()}`,
            average: webhookPrice ? parseFloat(webhookPrice) : 0,
            price: webhookPrice ? parseFloat(webhookPrice) : 0,
            amount: parseFloat(webhookAmountOrPercentage),
            status: 'closed'
        };
    }

    // 2. Fetch Decrypted API Keys
    const keys = await db.select().from(apiKeys).where(eq(apiKeys.id, bot.apiKeyId)).execute();
    const exchangeKeys = keys[0];

    if (!exchangeKeys) {
        throw new Error(`API keys for ${bot.exchange} not configured.`);
    }

    const apiKey = decrypt(exchangeKeys.apiKey);
    const secret = decrypt(exchangeKeys.apiSecret);

    const ccxtExchangeId = getExchangeInstance(bot.exchange, bot.marketType);
    
    // @ts-ignore
    const exchangeClass = ccxt[ccxtExchangeId];
    if (!exchangeClass) {
        throw new Error(`Unsupported exchange: ${bot.exchange}`);
    }

    // Instantiate CCXT Exchange
    const exchange = new (exchangeClass as any)({
        apiKey: apiKey,
        secret: secret,
        enableRateLimit: true,
        options: {
            defaultType: bot.marketType, // 'spot' or 'futures'
            adjustForTimeDifference: true,
            recvWindow: 10000
        }
    });

    // 3. Set Leverage (Futures Only)
    if (bot.marketType === 'futures' && bot.leverage > 1) {
        try {
            await exchange.setLeverage(bot.leverage, bot.pair);
        } catch (e: any) {
            console.log(`[LEVERAGE] Could not set leverage to ${bot.leverage}: ${e.message}`);
        }
    }

    await exchange.loadMarkets();

    // 4. Calculate Order Size (Base Currency)
    let orderAmount = 0;
    const ticker = await exchange.fetchTicker(bot.pair);
    const currentPrice = ticker.last || 0;

    if (bot.sizeType === 'percentage') {
        // Dynamic % of balance
        const balance = await exchange.fetchBalance();
        const quoteCurrency = bot.pair.split('/')[1]; // e.g. USDT
        const availableQuote = balance[quoteCurrency]?.free || 0;
        
        const amountInQuote = availableQuote * (bot.tradeSizePercent / 100);
        orderAmount = amountInQuote / currentPrice;
    } else {
        // Fixed Quote Currency Amount (e.g., 100 USDT)
        orderAmount = bot.tradeSizePercent / currentPrice; 
    }

    // Override with webhook amount if they explicitly sent a fixed base amount instead of using bot settings
    if (webhookAmountOrPercentage && parseFloat(webhookAmountOrPercentage) > 0) {
        orderAmount = parseFloat(webhookAmountOrPercentage);
    }

    // CCXT requires proper precision
    const market = exchange.market(bot.pair);
    orderAmount = parseFloat(exchange.amountToPrecision(bot.pair, orderAmount));

    if (orderAmount <= 0) {
        throw new Error('Order amount is zero or less than minimum required');
    }

    // 5. Execute Entry Order
    const type = bot.orderType === 'limit' ? 'limit' : 'market';
    const price = bot.orderType === 'limit' ? (webhookPrice ? parseFloat(webhookPrice) : currentPrice) : undefined;
    
    const order = await exchange.createOrder(bot.pair, type, side, orderAmount, price);
    
    const fillPrice = order.average || order.price || currentPrice;

    let tpOrderId: string | undefined;
    let slOrderId: string | undefined;

    // 6. Execute Stop Loss & Take Profit Conditional Orders
    try {
        if (bot.slPercent) {
            const slMultiplier = side === 'buy' ? (1 - bot.slPercent / 100) : (1 + bot.slPercent / 100);
            const slPrice = fillPrice * slMultiplier;
            const slSide = side === 'buy' ? 'sell' : 'buy';
            
            const slOrder = await exchange.createOrder(bot.pair, 'stop_market', slSide, orderAmount, undefined, {
                stopPrice: exchange.priceToPrecision(bot.pair, slPrice),
                reduceOnly: true
            });
            slOrderId = slOrder.id;
        }

        if (bot.tpPercent) {
            const tpMultiplier = side === 'buy' ? (1 + bot.tpPercent / 100) : (1 - bot.tpPercent / 100);
            const tpPrice = fillPrice * tpMultiplier;
            const tpSide = side === 'buy' ? 'sell' : 'buy';

            const tpOrder = await exchange.createOrder(bot.pair, 'take_profit_market', tpSide, orderAmount, undefined, {
                stopPrice: exchange.priceToPrecision(bot.pair, tpPrice),
                reduceOnly: true
            });
            tpOrderId = tpOrder.id;
        }
    } catch (conditionalError: any) {
        console.error(`[SL/TP ERROR] Failed to place conditional orders: ${conditionalError.message}`);
        // We do not throw here, because the main entry order was already successful.
    }

    return {
        ...order,
        tpOrderId,
        slOrderId
    };
}
