PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_elo_records` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`elo` real DEFAULT 1500 NOT NULL,
	`confidence` real DEFAULT 350 NOT NULL,
	`comparisons` integer DEFAULT 0 NOT NULL,
	`last_played_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_elo_records`("item_id", "elo", "confidence", "comparisons", "last_played_at") SELECT "item_id", "elo", "confidence", "comparisons", "last_played_at" FROM `elo_records`;--> statement-breakpoint
DROP TABLE `elo_records`;--> statement-breakpoint
ALTER TABLE `__new_elo_records` RENAME TO `elo_records`;--> statement-breakpoint
PRAGMA foreign_keys=ON;