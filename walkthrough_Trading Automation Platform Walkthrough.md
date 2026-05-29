# Trading Automation Platform Walkthrough

The initial version of the crypto trading automation platform has been successfully scaffolded and implemented using a monolithic VPS-ready architecture.

## Overview of Architecture

As agreed, the project uses a unified workspace (`npm workspaces`) to organize the system into three main packages:

1. **`packages/database`**: Uses Drizzle ORM and `@libsql/client` connected to **Turso**. The schema tracks `users`, encrypted `api_keys`, trading `bots`, and `trades` history. Turso provides an edge-replicated database accessible over HTTP/WebSockets.
2. **`apps/engine`**: A Node.js backend using Express to serve as the webhook listener for TradingView. It integrates the `ccxt` library for executing market orders on **Binance** and **Bybit**, and the `telegraf` library to fire instant Telegram notifications upon successful execution.
3. **`apps/web`**: A highly interactive Next.js 15 frontend featuring a "Dark Mode First" aesthetic. Uses Radix UI and Shadcn components for premium visual excellence. Features Server Actions for secure database connectivity.

## Features Implemented

### 1. Unified Monorepo
Using `npm workspaces`, the repository isolates backend logic, frontend UI, and the Turso database schema into modular packages while keeping development completely unified.

### 2. Live Dashboard & CCXT Integration
The Next.js dashboard uses Server Actions to directly fetch your real-time portfolio balance across all configured exchanges by securely decrypting your API keys and querying Binance/Bybit via CCXT. It also pulls live active bots and recent trades directly from Turso.

### 3. API Key Security (AES-256)
A dedicated **Settings** page allows you to securely input your Binance and Bybit API Keys. The system encrypts them using standard Node `crypto` (`aes-256-cbc`) before saving them to Turso, ensuring your raw keys never touch the database. The Engine decrypts them safely in memory just milliseconds before executing a trade.

### 4. Dynamic Bot Creation
The **Bots & Strategies** page features a Dialog to instantly generate new bot configurations. Upon creation, you receive your dedicated TradingView Webhook URL and the exact JSON payload format needed to trigger it.

### 5. Instant Trade Execution
The `apps/engine` Express server listens for Webhook POST requests. Upon receiving a valid request containing your configured secret, it validates the payload against Turso, dynamically instantiates CCXT, executes the order (e.g. `buy BTC/USDT`), saves the trade history, and fires a Telegram notification.vironment variables when running the containers.

> [!TIP]
> To deploy, you can simply clone this repository onto your VPS and run:
> ```bash
> docker compose up -d --build
> ```

## Testing Locally

1. Go to the engine directory and start the webhook listener: `npm run dev`
2. Go to the web directory and start the Next.js app: `npm run dev`
3. View the premium dashboard at [http://localhost:3000](http://localhost:3000)

## Next Steps

This foundation sets up the layout, the database schema, and the execution engine logic. To finalize the project, we can proceed with:
- Implementing the API routes in Next.js to read from the database and populate the charts dynamically.
- Finalizing the logic to add/encrypt API keys directly from the Web Dashboard.
