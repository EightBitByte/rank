PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "title") SELECT "id", "title" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_elo_records` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`elo` integer NOT NULL,
	`confidence` integer NOT NULL,
	`comparisons` integer DEFAULT 0 NOT NULL,
	`last_played_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_elo_records`("item_id", "elo", "confidence", "comparisons", "last_played_at") SELECT "item_id", "elo", "confidence", "comparisons", "last_played_at" FROM `elo_records`;--> statement-breakpoint
DROP TABLE `elo_records`;--> statement-breakpoint
ALTER TABLE `__new_elo_records` RENAME TO `elo_records`;--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`winner_id` integer NOT NULL,
	`loser_id` integer NOT NULL,
	`time_played` integer NOT NULL,
	FOREIGN KEY (`winner_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loser_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_matches`("winner_id", "loser_id", "time_played") SELECT "winner_id", "loser_id", "time_played" FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;