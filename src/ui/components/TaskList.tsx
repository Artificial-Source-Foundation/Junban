import { lazy, Suspense, useEffect, useState } from "react";
import { TaskListBase } from "./task-list/TaskListBase.js";
import type { TaskListProps } from "./task-list/TaskListShared.js";

const loadEnhancedTaskList = () => import("./task-list/TaskListEnhanced.js");

const TaskListEnhanced = lazy(() =>
  loadEnhancedTaskList().then((module) => ({ default: module.TaskListEnhanced })),
);

export function TaskList(props: TaskListProps) {
  const [enhancedReady, setEnhancedReady] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!props.onReorder) return;

    let cancelled = false;
    const preload = async () => {
      await loadEnhancedTaskList();
      if (!cancelled) {
        setEnhancedReady(true);
      }
    };

    const timeoutHandle = globalThis.setTimeout(() => {
      void preload();
    }, 0);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutHandle);
    };
  }, [props.onReorder]);

  if (!props.onReorder || !enhancedReady) {
    return (
      <TaskListBase {...props} expandedIds={expandedIds} onToggleExpand={handleToggleExpand} />
    );
  }

  return (
    <Suspense
      fallback={
        <TaskListBase {...props} expandedIds={expandedIds} onToggleExpand={handleToggleExpand} />
      }
    >
      <TaskListEnhanced {...props} />
    </Suspense>
  );
}

export type { TaskListProps } from "./task-list/TaskListShared.js";
