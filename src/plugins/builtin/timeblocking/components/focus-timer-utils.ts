import type { TimeBlock } from "../types.js";
import { timeToMinutes } from "./TimelineColumn.js";

export function formatRemaining(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function isBlockActive(block: TimeBlock): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (block.date !== todayStr) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= timeToMinutes(block.startTime) && nowMinutes < timeToMinutes(block.endTime);
}
