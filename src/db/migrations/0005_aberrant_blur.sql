ALTER TABLE `projects` ADD `parent_id` text REFERENCES projects(id);--> statement-breakpoint
ALTER TABLE `projects` ADD `is_favorite` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `view_style` text DEFAULT 'list' NOT NULL;