const fetch = require('node-fetch') || globalThis.fetch;

async function test() {
  const stockIqPayload = {
    symbol: 'BTCUSDT',
    asset_type: 'crypto',
    type: 'long',
    status: 'closed',
    quantity: 1,
    entry_price: 50000,
    exit_price: 51000,
    commissions: 0,
    entry_date: new Date().toISOString(),
    exit_date: new Date().toISOString(),
    notes: 'Test trade'
  };

  const response = await fetch('http://localhost:3001/api/journal/trades', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We know there's a key in StockIQ, but since we are testing Zod payload, we can use ANY key or invalid key. If it's invalid key it will say 'Invalid API Key', which means Zod hasn't run.
      // So we need a valid key. I will fetch the key from the SQLite DB of Trading Automation first? No, the user provided the API Key to the DB.
      // Wait! The user's key is in `users.portaiqApiKey` in `Trading Automation`. Let's get it.
    },
    body: JSON.stringify(stockIqPayload)
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Body:", text);
}

test();
