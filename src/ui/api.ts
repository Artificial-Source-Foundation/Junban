import type { Task, CreateTaskInput, UpdateTaskInput, Project } from "../core/types.js";

const BASE = "/api";

export const api = {
  async listTasks(params?: { search?: string; projectId?: string; status?: string }): Promise<Task[]> {
    const url = new URL(`${BASE}/tasks`, window.location.origin);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.projectId) url.searchParams.set("projectId", params.projectId);
    if (params?.status) url.searchParams.set("status", params.status);
    const res = await fetch(url.toString());
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

  async listProjects(): Promise<Project[]> {
    const res = await fetch(`${BASE}/projects`);
    return res.json();
  },
};
