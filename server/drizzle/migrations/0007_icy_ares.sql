ALTER TABLE `categories` ADD `locked` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE `categories` SET `locked` = 1 WHERE `title` = 'Movies';
--> statement-breakpoint
INSERT INTO `categories` (`title`, `color`, `locked`)
SELECT 'Movies', '#1e40ff', 1
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `title` = 'Movies');
--> statement-breakpoint
UPDATE `categories` SET `locked` = 1 WHERE `title` = 'TV';
--> statement-breakpoint
INSERT INTO `categories` (`title`, `color`, `locked`)
SELECT 'TV', '#00c48c', 1
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `title` = 'TV');