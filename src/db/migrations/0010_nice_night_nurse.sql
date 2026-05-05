CREATE INDEX `chat_messages_session_id_id_idx` ON `chat_messages` (`session_id`,`id`);--> statement-breakpoint
CREATE INDEX `chat_messages_session_created_at_idx` ON `chat_messages` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `task_tags_tag_id_idx` ON `task_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX `tasks_status_sort_idx` ON `tasks` (`status`,`sort_order`,`created_at`);--> statement-breakpoint
CREATE INDEX `tasks_project_sort_idx` ON `tasks` (`project_id`,`sort_order`,`created_at`);--> statement-breakpoint
CREATE INDEX `tasks_section_sort_idx` ON `tasks` (`section_id`,`sort_order`,`created_at`);--> statement-breakpoint
CREATE INDEX `tasks_parent_sort_idx` ON `tasks` (`parent_id`,`sort_order`,`created_at`);--> statement-breakpoint
CREATE INDEX `tasks_reminder_due_idx` ON `tasks` (`status`,`remind_at`);