# Multi-Subaccount Support

To support multiple subaccounts properly, the entire system needs to shift from a "one-key-per-exchange" model to a "multiple-named-keys" model. This touches the database, the Settings UI, the Bot Engine, and the Dashboard.

## User Review Required

> [!WARNING]
> **Database Migration Required:** This change will alter the database schema. We will add a `name` to API keys and an `api_key_id` to Bots. If you have existing test bots, they may need to be recreated after the update since they won't be linked to a specific subaccount.

## Proposed Changes

### Database Schema Updates
- **`packages/database/schema.ts`**
  - **[MODIFY]** `apiKeys`: Add `name: text('name').notNull()` to identify the subaccount (e.g. "TradeAuto_BTC").
  - **[MODIFY]** `bots`: Add `apiKeyId: integer('api_key_id').references(() => apiKeys.id)` so each bot knows exactly which subaccount to execute trades on.
- **`packages/database/migrations`**
  - **[NEW]** Generate and apply a new Drizzle migration.

---

### Dashboard & Portfolio Engine
- **`apps/web/src/actions/portfolio.ts`**
  - **[MODIFY]** Update `getCompletePortfolio` to not only aggregate total assets, but also track and return a breakdown of `totalUsd` per API Key (Subaccount).
- **`apps/web/src/app/page.tsx`**
  - **[MODIFY]** Add a new "Subaccounts" card to the dashboard that lists all your configured subaccounts, their exchange, and their individual USD equity.

---

### Settings UI (API Key Management)
- **`apps/web/src/actions/keys.ts`**
  - **[MODIFY]** Add CRUD actions: `getApiKeys`, `addApiKey(name, exchange, key, secret)`, `deleteApiKey(id)`.
- **`apps/web/src/app/settings/page.tsx`**
  - **[MODIFY]** Completely overhaul the page. Instead of two fixed inputs for Binance/Bybit, show a dynamic list of configured subaccounts with a "Add New Subaccount" dialog.

---

### Bot Management & Engine Execution
- **`apps/web/src/app/bots/page.tsx`**
  - **[MODIFY]** When creating a bot, replace the "Exchange" dropdown with an "Account" dropdown. The user will select a specific Subaccount to bind the bot to.
- **`apps/engine/src/exchange/ccxt-client.ts`**
  - **[MODIFY]** During bot execution, instead of guessing which key to use based on the exchange name, the engine will fetch the exact API key using `bot.apiKeyId`.

## Verification Plan
1. Apply migrations and ensure the database starts correctly.
2. Go to **Settings** and add two different Subaccount API keys.
3. Check the **Dashboard** and verify that both subaccounts appear independently with their respective balances.
4. Go to **Bots**, create a new bot, and verify the subaccount dropdown works and fetches the correct live balance for the chosen subaccount.
