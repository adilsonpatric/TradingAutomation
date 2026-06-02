import { getExchangeMarkets } from './src/actions/ccxt';

async function test() {
    // Assuming user 1, api key id 1, spot
    const markets = await getExchangeMarkets(1, 1, 'spot');
    console.log("Markets:", markets.length);
}
test();
