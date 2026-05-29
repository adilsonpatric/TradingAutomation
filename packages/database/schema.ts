import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  webhookSecret: text('webhook_secret').notNull(),
  telegramChatId: text('telegram_chat_id'),
});

export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exchange: text('exchange').notNull(), // 'binance' or 'bybit'
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
});

export const bots = sqliteTable('bots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
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
  timestamp: integer('timestamp', { mode: 'timestamp' }).defaultNow().notNull(),
});
