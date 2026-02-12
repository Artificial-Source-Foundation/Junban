import { PRIORITIES } from "../config/defaults.js";

/** Get priority metadata by value. */
export function getPriority(value: number) {
  const entry = Object.values(PRIORITIES).find((p) => p.value === value);
  return entry ?? null;
}

/** Sort tasks by priority (P1 first, null last). */
export function sortByPriority<T extends { priority: number | null }>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    if (a.priority === null && b.priority === null) return 0;
    if (a.priority === null) return 1;
    if (b.priority === null) return -1;
    return a.priority - b.priority;
  });
}
