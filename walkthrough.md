# Trading Automation Platform Walkthrough

The initial version of the crypto trading automation platform has been successfully scaffolded and implemented using a monolithic VPS-ready architecture.

## Overview of Architecture

As agreed, the project uses a unified workspace (`npm workspaces`) to organize the system into three main packages:

1. **`packages/database`**: Uses Drizzle ORM and `@libsql/client` (SQLite). The schema tracks `users`, encrypted `api_keys`, trading `bots`, and `trades` history. A local `local.db` file is used to ensure absolute minimum latency.
2. **`apps/engine`**: A Node.js backend using Express to serve as the webhook listener for TradingView. It integrates the `ccxt` library for executing market orders on **Binance** and **Bybit**, and the `telegraf` library to fire instant Telegram notifications upon successful execution.
3. **`apps/web`**: A modern Next.js 15 (App Router) frontend configured with a **"Dark Mode First"** premium aesthetic using Tailwind CSS and `shadcn/ui` components. It features a responsive sidebar and a main dashboard to monitor the portfolio value and active bots.

## Deployment Setup

To make the deployment straightforward on a low-latency VPS:
- We created a `docker-compose.yml` file in the root directory.
- `apps/engine` and `apps/web` have dedicated `Dockerfile`s.
- The `database` volume is shared, meaning the Engine can write trade data and the Web Dashboard can instantly read it.

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
