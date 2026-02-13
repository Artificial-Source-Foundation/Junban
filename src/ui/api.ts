import type { Task, CreateTaskInput, UpdateTaskInput } from "../core/types.js";

const BASE = "/api";

export const api = {
  async listTasks(): Promise<Task[]> {
    const res = await fetch(`${BASE}/tasks`);
    return res.json();
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const res = await fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.json();
  },

  async completeTask(id: string): Promise<Task> {
    const res = await fetch(`${BASE}/tasks/${id}/complete`, {
      method: "POST",
    });
    return res.json();
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const res = await fetch(`${BASE}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    await fetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
  },
};
