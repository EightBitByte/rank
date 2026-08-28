CREATE TABLE `elo_records` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`elo` integer,
	`confidence` integer,
	`comparisons` integer,
	`last_played_at` integer,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`winner_id` integer,
	`loser_id` integer,
	`time_played` integer,
	FOREIGN KEY (`winner_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loser_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `items` DROP COLUMN `elo`;