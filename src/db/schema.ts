import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "completed", "cancelled"] }).notNull().default("pending"),
  priority: integer("priority"),
  dueDate: text("due_date"),
  dueTime: integer("due_time", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
  projectId: text("project_id").references(() => projects.id),
  recurrence: text("recurrence"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3b82f6"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6b7280"),
});

export const taskTags = sqliteTable("task_tags", {
  taskId: text("task_id").notNull().references(() => tasks.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
});

export const pluginSettings = sqliteTable("plugin_settings", {
  pluginId: text("plugin_id").primaryKey(),
  settings: text("settings").notNull().default("{}"),
  updatedAt: text("updated_at").notNull(),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
