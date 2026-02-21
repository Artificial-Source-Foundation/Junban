import { toDateKey } from "./format-date.js";

/** Check if a date string represents today. */
export function isToday(dateStr: string): boolean {
  const today = toDateKey(new Date());
  return dateStr.startsWith(today);
}

/** Check if a date string is in the past. */
export function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

/** Format a date for display. */
export function formatDate(dateStr: string, includeTime: boolean = false): string {
  const date = new Date(dateStr);
  if (includeTime) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
}

/** Get the start of today as an ISO string. */
export function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Get the end of today as an ISO string. */
export function todayEnd(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
