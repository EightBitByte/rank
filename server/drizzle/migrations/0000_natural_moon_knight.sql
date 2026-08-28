CREATE TABLE `assets` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer,
	`type` text DEFAULT 'image',
	`href` text,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY NOT NULL,
	`category_id` integer,
	`title` text,
	`description` text,
	`elo` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
