# Data Connectivity & Dashboard Logic

Now that the core infrastructure, database, and webhook engine are fully functional, the next major step is to bring the Next.js frontend to life by connecting it to your Turso database.

## Proposed Changes

### 1. Next.js Server Actions (Backend Logic)
Instead of building complex API endpoints, we will use modern Next.js Server Actions to fetch and mutate data securely.
- **`src/actions/bots.ts`**: Fetch active bots, create new bots, toggle bots on/off.
- **`src/actions/trades.ts`**: Fetch recent trades history.
- **`src/actions/keys.ts`**: Securely save encrypted Binance and Bybit API keys to the database.

### 2. Settings Page (API Keys)
#### [NEW] `src/app/settings/page.tsx`
Create a clean form where you can securely input and save your Binance and Bybit API Keys and Secrets. The engine requires these keys to be present in the database to execute CCXT trades.

### 3. Bot Creation Form
#### [MODIFY] `src/app/bots/page.tsx`
Turn the "New Bot" button into a Dialog (Modal) where you can select the exchange (Binance/Bybit), input the trading pair (e.g., BTC/USDT), and set the trade size. Upon saving, it will insert the bot into Turso and generate the Webhook URL for TradingView.

### 4. Live Dashboard Data
#### [MODIFY] `src/app/page.tsx`
Replace the hardcoded mock data with live database queries using the new Server Actions. The "Recent Trades" and "Active Bots" counts will reflect your actual Turso data.

## Open Questions
> [!NOTE]
> 1. For the "Total Portfolio Value" on the dashboard, do you want me to write logic that fetches your live balance from Binance/Bybit via CCXT? Or should we focus purely on the trade history for now?
> 2. How are you currently planning to encrypt your API keys before saving them? We can implement a simple AES encryption using an `ENCRYPTION_KEY` environment variable. Does that work for you?
