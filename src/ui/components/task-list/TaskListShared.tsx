import type { Task } from "../../../core/types.js";

export const VIRTUALIZE_THRESHOLD = 50;
export const ESTIMATED_ROW_HEIGHT = 48;
export const ADD_SUBTASK_ROW_HEIGHT = 40;

export interface ChildStats {
  children: Task[];
  completed: number;
  total: number;
}

export interface FlatEntry {
  task: Task;
  depth: number;
  showAddSubtask?: boolean;
}

export interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  selectedTaskId: string | null;
  emptyMessage?: string;
  selectedTaskIds?: Set<string>;
  onMultiSelect?: (
    id: string,
    event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean },
  ) => void;
  onReorder?: (orderedIds: string[]) => void;
  onAddSubtask?: (parentId: string, title: string) => void;
  onUpdateDueDate?: (taskId: string, dueDate: string | null) => void;
  onContextMenu?: (taskId: string, position: { x: number; y: number }) => void;
  blockedTaskIds?: Set<string>;
}

export function buildChildStats(tasks: Task[]): Map<string, ChildStats> {
  const map = new Map<string, ChildStats>();
  for (const task of tasks) {
    if (!task.parentId) continue;
    if (!map.has(task.parentId)) {
      map.set(task.parentId, { children: [], completed: 0, total: 0 });
    }
    const stats = map.get(task.parentId)!;
    stats.children.push(task);
    stats.total += 1;
    if (task.status === "completed") {
      stats.completed += 1;
    }
  }
  return map;
}
