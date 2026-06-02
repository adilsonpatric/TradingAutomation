import ccxt from 'ccxt';

async function test() {
    const bybit = new ccxt.bybit();
    const markets = await bybit.loadMarkets();
    
    const btcusdt = markets['BTC/USDT'];
    console.log("Spot test:");
    console.log("BTC/USDT spot:", btcusdt?.spot);
    console.log("BTC/USDT swap:", btcusdt?.swap);
    console.log("BTC/USDT active:", btcusdt?.active);

    const btcswap = markets['BTC/USDT:USDT'];
    console.log("\nSwap test:");
    console.log("BTC/USDT:USDT spot:", btcswap?.spot);
    console.log("BTC/USDT:USDT swap:", btcswap?.swap);
    console.log("BTC/USDT:USDT active:", btcswap?.active);
}

test();
