CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exchange` text NOT NULL,
	`api_key` text NOT NULL,
	`api_secret` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`pair` text NOT NULL,
	`exchange` text NOT NULL,
	`trade_size_percent` real NOT NULL,
	`is_running` integer DEFAULT false NOT NULL,
	`sl_percent` real,
	`tp_percent` real,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bot_id` integer,
	`symbol` text NOT NULL,
	`side` text NOT NULL,
	`price` real NOT NULL,
	`amount` real NOT NULL,
	`timestamp` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`bot_id`) REFERENCES `bots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_secret` text NOT NULL,
	`telegram_chat_id` text
);
