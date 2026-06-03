import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkId: text('clerk_id').unique(),
  webhookSecret: text('webhook_secret').notNull(),
  telegramBotToken: text('telegram_bot_token'),
  telegramChatId: text('telegram_chat_id'),
  webhookDomain: text('webhook_domain'),
  syncIntervalMinutes: integer('sync_interval_minutes').default(10).notNull(),
  notifyTradeEntry: integer('notify_trade_entry', { mode: 'boolean' }).default(true).notNull(),
  notifyTradeClose: integer('notify_trade_close', { mode: 'boolean' }).default(true).notNull(),
  notifyTpSl: integer('notify_tp_sl', { mode: 'boolean' }).default(true).notNull(),
  portaiqApiKey: text('portaiq_api_key'),
  portaiqUrl: text('portaiq_url'),
});

export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().default('Main Account'),
  exchange: text('exchange').notNull(), // 'binance' or 'bybit'
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
});

export const bots = sqliteTable('bots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  apiKeyId: integer('api_key_id').references(() => apiKeys.id),
  pair: text('pair').notNull(),
  exchange: text('exchange').notNull(),
  marketType: text('market_type').default('spot').notNull(), // 'spot' or 'futures'
  isPaperTrading: integer('is_paper_trading', { mode: 'boolean' }).default(false).notNull(),
  leverage: integer('leverage').default(1),
  orderType: text('order_type').default('market').notNull(), // 'market' or 'limit'
  sizeType: text('size_type').default('percentage').notNull(), // 'percentage' or 'fixed'
  tradeSizePercent: real('trade_size_percent').notNull(), // used for both % and fixed amounts depending on sizeType
  cooldownSeconds: integer('cooldown_seconds').default(0).notNull(),
  lastExecutedAt: integer('last_executed_at', { mode: 'timestamp' }),
  isRunning: integer('is_running', { mode: 'boolean' }).default(false).notNull(),
  slPercent: real('sl_percent'),
  tpPercent: real('tp_percent'),
  userId: integer('user_id').references(() => users.id).notNull(),
});

export const trades = sqliteTable('trades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  botId: integer('bot_id').references(() => bots.id),
  symbol: text('symbol').notNull(),
  side: text('side').notNull(), // 'buy' or 'sell'
  price: real('price').notNull(),
  amount: real('amount').notNull(),
  exchangeOrderId: text('exchange_order_id'),
  tpOrderId: text('tp_order_id'),
  slOrderId: text('sl_order_id'),
  status: text('status').default('open').notNull(), // 'open' or 'closed'
  pnl: real('pnl'),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).defaultNow().notNull(),
  portaiqSynced: integer('portaiq_synced', { mode: 'boolean' }).default(false),
});
