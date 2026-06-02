# Advanced Bot Intelligence & Dashboard Upgrades

To make the platform smarter and more aligned with professional portfolio management software, we will implement the following features based on your request and the provided screenshot.

## Proposed Changes

### 1. Smart Bot Creation (Dynamic Pairs & Balances)
- **Searchable Asset Dropdown**: We will replace the manual "Trading Pair" text input with a searchable Combobox. It will dynamically fetch all valid trading pairs directly from Binance/Bybit via CCXT.
- **Live Fund Validation**: When you select a pair (e.g., `BTC/USDT`), the form will automatically query the exchange and display your available funds for both the Base (BTC) and Quote (USDT) assets directly in the UI.
- **Connection Visibility**: The form will clearly display which API Key (showing the last 4 characters) is currently being used, ensuring you know exactly which subaccount you are configuring.

### 2. IP Whitelisting & Custom Triggers
- **Database Update**: We will add `restrictIps` (boolean) and `allowedIps` (text) to the `bots` table.
- **Webhook Engine**: The Express server will validate the incoming request's IP address if IP Restriction is enabled. This secures your bot against unauthorized triggers.
- **Universal Payload**: The webhook payload is already standard JSON, meaning tools like **Make.com**, Zapier, or custom scripts can trigger it effortlessly.
- **Webhook URL Display**: We will explicitly show the full target Webhook URL (e.g., `https://your-domain.com/webhook`) on the Bot Card alongside the payload template.

### 3. Advanced Portfolio Dashboard
We will overhaul the `/` dashboard to match the provided screenshot:
- **CCXT Deep Fetch**: Instead of just tracking USDT, the engine will scan *all* your non-zero balances on the exchange, fetch their live market prices, and calculate their true USD value.
- **Pie Chart (Assets in %)**: We will integrate the `recharts` library to display a beautiful, interactive pie chart showing your portfolio distribution.
- **Assets in USD Table**: A table breaking down every asset you hold, its exact balance, and its USD value.
- **Bot Assets Table**: A table showing exactly which active bots are trading which assets.

## Open Questions

> [!IMPORTANT]
> 1. **IP Whitelisting**: If you are using webhooks from TradingView, their IP addresses change frequently (they use a pool of IPs). Do you want to manually whitelist all of TradingView's IPs, or do you simply want to rely on the `secret` key in the JSON payload for authentication and leave IPs unrestricted by default?
> 2. **Webhook URL Domain**: Since the backend runs on a VPS, the Webhook URL will look like `http://<YOUR_VPS_IP>:4000/webhook`. For the UI display, should I provide a global settings field where you can type in your domain (e.g., `https://api.mytradingbot.com`), or just use a generic placeholder?
