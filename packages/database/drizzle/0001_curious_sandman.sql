ALTER TABLE `api_keys` ADD `name` text DEFAULT 'Main Account' NOT NULL;--> statement-breakpoint
ALTER TABLE `bots` ADD `api_key_id` integer REFERENCES api_keys(id);--> statement-breakpoint
ALTER TABLE `bots` ADD `market_type` text DEFAULT 'spot' NOT NULL;--> statement-breakpoint
ALTER TABLE `bots` ADD `is_paper_trading` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `bots` ADD `leverage` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `bots` ADD `order_type` text DEFAULT 'market' NOT NULL;--> statement-breakpoint
ALTER TABLE `bots` ADD `size_type` text DEFAULT 'percentage' NOT NULL;--> statement-breakpoint
ALTER TABLE `bots` ADD `cooldown_seconds` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bots` ADD `last_executed_at` integer;--> statement-breakpoint
ALTER TABLE `trades` ADD `exchange_order_id` text;--> statement-breakpoint
ALTER TABLE `trades` ADD `tp_order_id` text;--> statement-breakpoint
ALTER TABLE `trades` ADD `sl_order_id` text;--> statement-breakpoint
ALTER TABLE `trades` ADD `status` text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE `trades` ADD `pnl` real;--> statement-breakpoint
ALTER TABLE `trades` ADD `portaiq_synced` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `clerk_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `telegram_bot_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `webhook_domain` text;--> statement-breakpoint
ALTER TABLE `users` ADD `sync_interval_minutes` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notify_trade_entry` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notify_trade_close` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notify_tp_sl` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `portaiq_api_key` text;--> statement-breakpoint
ALTER TABLE `users` ADD `portaiq_url` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);