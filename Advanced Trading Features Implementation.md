# Advanced Trading Features Implementation

You've elected to implement the full suite of advanced trading features! This will transform the bot into a professional-grade algorithmic engine. 

Here is how we will architect and implement these upgrades across the stack.

## Proposed Changes

### 1. Database Schema Upgrades
We will add several new configuration columns to the `bots` table in `packages/database/schema.ts`.
- **`isPaperTrading`** (boolean): Determines if the engine actually fires the CCXT order.
- **`leverage`** (integer): The leverage multiplier to apply for futures pairs (e.g., 10x).
- **`orderType`** (string): `'market'` or `'limit'`.
- **`sizeType`** (string): `'percentage'` (compounding) or `'fixed'` (fixed USDT).
- **`slPercent`** & **`tpPercent`** (real): Already partially in schema, will fully utilize them.
- **`cooldownSeconds`** (integer): Minimum time required between consecutive webhook signals.
- **`lastExecutedAt`** (timestamp): Tracked internally to enforce the cooldown.

*We will run a Turso/Drizzle migration to apply these changes securely to your edge database.*

### 2. Frontend: Advanced Bot Configuration
#### [MODIFY] `apps/web/src/app/bots/page.tsx`
We will expand the "New Bot" Dialog into a scrollable, advanced form with distinct sections:
- **General**: Name, Exchange, Pair, Paper Trading Toggle.
- **Sizing**: Type (Fixed USDT vs % of Balance), Amount, Leverage (if applicable).
- **Execution**: Order Type (Market/Limit), Cooldown timer.
- **Risk Management**: Stop Loss %, Take Profit %.

#### [MODIFY] `apps/web/src/actions/bots.ts`
Update the `createBot` server action to accept and insert all the new configuration fields into Turso.

### 3. Execution Engine: CCXT Logic Overhaul
#### [MODIFY] `apps/engine/src/server.ts`
- **Signal Debouncing**: When a webhook arrives, we will check `bot.lastExecutedAt`. If `Date.now() - lastExecutedAt < cooldownSeconds * 1000`, we will gracefully reject the signal as a duplicate.
- **Paper Trading**: If `bot.isPaperTrading` is true, we will skip calling the `executeTrade` function, but still log the trade to the database and send the Telegram notification prefixed with `[PAPER TRADE]`.

#### [MODIFY] `apps/engine/src/exchange/ccxt-client.ts`
- **Leverage Integration**: If `leverage > 1`, call `exchange.setLeverage(leverage, symbol)` before placing the order.
- **Order Types**: If `orderType === 'limit'`, use the price provided in the webhook payload (we will update the payload spec to include `price`).
- **SL/TP Orders**: After the entry order succeeds, if `slPercent` or `tpPercent` is configured, we will immediately place conditional limit/stop orders (or OCO orders if the exchange supports them natively via CCXT).

## Open Questions

> [!IMPORTANT]
> 1. For **Leverage**, Binance and Bybit handle futures/derivatives through different API namespaces (e.g. `binanceusdm` vs `binance`). If you plan to trade futures, should we explicitly add a "Market Type" toggle (Spot vs. Futures) in the Bot creation form so CCXT knows which API to use?
> 2. For **Stop Loss/Take Profit**, CCXT handles conditional orders slightly differently per exchange. For this initial pass, I will implement them as separate Limit (Take Profit) and Stop-Market (Stop Loss) orders placed immediately after the entry order fills. Does this work for you?
