# Personal Crypto Trading Automation Platform - Implementation Plan

This plan outlines the development of a hybrid, low-latency cryptocurrency trading automation platform tailored for a single user. Based on the provided specifications, the system separates the frontend dashboard (hosted on Vercel for agility) from the trading execution engine (hosted on a collocated VPS for low latency), using Turso (Edge SQLite) to bridge state between them. The platform will receive signals via TradingView webhooks, execute orders on major exchanges, and provide a premium "Dark Mode First" dashboard to monitor performance.

## User Review Required

> [!IMPORTANT]
> The architecture defines a hybrid approach:
> 1. **Vercel** for the Next.js Frontend Dashboard.
> 2. **Turso (SQLite)** for the Database.
> 3. **Colocated VPS** for the Trading Execution Engine (Node.js/TypeScript).
> Please confirm if you are comfortable deploying and managing the Execution Engine on a separate VPS, or if you prefer a simplified monolithic approach where the frontend and backend run together on the VPS.

## Open Questions

> [!WARNING]
> 1. **Exchange Preference**: Which exchange(s) (e.g., Binance, Bybit, Kraken) should we prioritize for the initial integration Phase 1?
> 2. **Execution Engine Language**: The HFT doc mentions Python/Go/Rust, but the Tech Spec mentions Node.js (TypeScript) with CCXT. We will proceed with Node.js (TypeScript) for the engine to maintain a unified tech stack unless you prefer otherwise. Is Node.js acceptable for the execution engine?
> 3. **Telegram Notifications**: Do you already have a Telegram Bot Token, or should we mock this part initially?

## Proposed Changes

We will use a Monorepo structure (e.g., Turborepo) to share types and database schemas between the Web Dashboard and the Execution Engine.

### 1. Database Layer (Turso)
- Schema definition for `Users/Config`, `API_Keys` (encrypted), `Bots` (strategy configs), and `Trades` (history and open positions).

#### [NEW] `packages/database/schema.ts`
#### [NEW] `packages/database/index.ts`

---

### 2. Trading Execution Engine (VPS/Node.js)
- A standalone Node.js (TypeScript) application.
- **Fast Webhook Listener**: Endpoint to receive and validate TradingView JSON payloads.
- **CCXT Integration**: Engine to decrypt API keys from Turso, format orders, and execute them on the exchange.
- **WebSocket/Polling**: To track open positions and trigger Stop Loss / Take Profit.
- **Notifier**: Integration with Telegram API for trade alerts.

#### [NEW] `apps/engine/src/server.ts` (Webhook listener)
#### [NEW] `apps/engine/src/exchange/ccxt-client.ts` (Execution logic)
#### [NEW] `apps/engine/src/db/turso-client.ts` (DB Sync)

---

### 3. Frontend Dashboard (Vercel/Next.js)
- **Next.js 15+ (App Router)** setup.
- **Tailwind CSS & shadcn/ui**: Implementing a premium dark mode UI (slate/midnight blue with vibrant accents).
- **Zustand & TanStack Query**: State management for realtime data.
- **Lightweight Charts**: Integration for visualizing trades.
- Pages: 
  - Overview/Dashboard (Portfolio, Active Bots, Manual Override)
  - Bot Configuration (Webhook setup, Pair, Size, TP/SL)
  - Trade History & Logs

#### [NEW] `apps/web/app/page.tsx` (Dashboard)
#### [NEW] `apps/web/app/bots/page.tsx` (Bot management)
#### [NEW] `apps/web/components/charts/TradingChart.tsx`
#### [NEW] `apps/web/tailwind.config.ts` & `globals.css` (Premium dark UI tokens)

## Verification Plan

### Automated Tests
- Create unit tests for webhook payload validation.
- Create unit tests for order size calculation and TP/SL logic.

### Manual Verification
- Deploy Database on Turso.
- Run Execution Engine locally with testnet exchange API keys (e.g., Binance Testnet).
- Trigger mock TradingView webhooks via `curl` or Postman to verify order execution.
- Run Frontend Dashboard locally to verify real-time state updates from Turso and UI/UX responsiveness.
