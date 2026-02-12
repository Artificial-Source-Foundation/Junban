import { z } from "zod";

export const TaskStatus = z.enum(["pending", "completed", "cancelled"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const Priority = z.number().int().min(1).max(4).nullable();
export type Priority = z.infer<typeof Priority>;

export const CreateTaskInput = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).nullable().optional(),
  priority: Priority.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueTime: z.boolean().optional().default(false),
  projectId: z.string().nullable().optional(),
  recurrence: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInput>;

export const UpdateTaskInput = CreateTaskInput.partial();
export type UpdateTaskInput = z.infer<typeof UpdateTaskInput>;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number | null;
  dueDate: string | null;
  dueTime: boolean;
  completedAt: string | null;
  projectId: string | null;
  recurrence: string | null;
  tags: Tag[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  sortOrder: number;
  archived: boolean;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
