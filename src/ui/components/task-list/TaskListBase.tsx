import { useCallback, useContext, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { TaskItem } from "../TaskItem.js";
import { InlineAddSubtask } from "../InlineAddSubtask.js";
import { EmptyState } from "../EmptyState.js";
import { BlockedTaskIdsContext } from "../../context/BlockedTaskIdsContext.js";
import {
  buildChildStats,
  type ChildStats,
  type FlatEntry,
  type TaskListProps,
} from "./TaskListShared.js";
import type { Task } from "../../../core/types.js";

export interface TaskListBaseRenderContext {
  childStatsMap: Map<string, ChildStats>;
  visibleTasks: FlatEntry[];
  expandedIds: Set<string>;
  blockedTaskIds?: Set<string>;
  isMultiSelectActive: boolean;
  handleToggleExpand: (id: string) => void;
}

interface TaskListBaseProps extends TaskListProps {
  renderList?: (context: TaskListBaseRenderContext) => React.ReactNode;
  expandedIds?: Set<string>;
  onToggleExpand?: (id: string) => void;
}

export function TaskListBase({
  tasks,
  onToggle,
  onSelect,
  selectedTaskId,
  emptyMessage,
  selectedTaskIds,
  onMultiSelect,
  onAddSubtask,
  onUpdateDueDate,
  onContextMenu,
  blockedTaskIds: blockedTaskIdsProp,
  renderList,
  expandedIds: expandedIdsProp,
  onToggleExpand: onToggleExpandProp,
}: TaskListBaseProps) {
  const blockedFromContext = useContext(BlockedTaskIdsContext);
  const blockedTaskIds = blockedTaskIdsProp ?? blockedFromContext;
  const [localExpandedIds, setLocalExpandedIds] = useState<Set<string>>(new Set());
  const expandedIds = expandedIdsProp ?? localExpandedIds;

  const localHandleToggleExpand = useCallback((id: string) => {
    setLocalExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleExpand = onToggleExpandProp ?? localHandleToggleExpand;

  const childStatsMap = useMemo(() => buildChildStats(tasks), [tasks]);
  const topLevel = useMemo(() => tasks.filter((task) => !task.parentId), [tasks]);

  const visibleTasks = useMemo(() => {
    function flattenVisible(items: Task[], depth: number): FlatEntry[] {
      const result: FlatEntry[] = [];
      for (const item of items) {
        const stats = childStatsMap.get(item.id);
        result.push({ task: item, depth });
        if (stats && expandedIds.has(item.id)) {
          result.push(...flattenVisible(stats.children, depth + 1));
          if (onAddSubtask) {
            result.push({ task: item, depth: depth + 1, showAddSubtask: true });
          }
        }
      }
      return result;
    }

    return flattenVisible(topLevel, 0);
  }, [topLevel, childStatsMap, expandedIds, onAddSubtask]);

  const isMultiSelectActive = selectedTaskIds ? selectedTaskIds.size > 0 : false;

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={40} strokeWidth={1.25} />}
        title={emptyMessage ?? "No tasks yet. Add one above!"}
      />
    );
  }

  if (renderList) {
    return renderList({
      childStatsMap,
      visibleTasks,
      expandedIds,
      blockedTaskIds,
      isMultiSelectActive,
      handleToggleExpand,
    });
  }

  return (
    <div role="list" aria-label="Tasks" className="space-y-0">
      {visibleTasks.map((entry) => {
        if (entry.showAddSubtask) {
          return (
            <InlineAddSubtask
              key={`add-subtask-${entry.task.id}`}
              parentId={entry.task.id}
              depth={entry.depth}
              onAdd={onAddSubtask!}
            />
          );
        }

        const { task, depth } = entry;
        const stats = childStatsMap.get(task.id);
        return (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onSelect={onSelect}
            isSelected={selectedTaskId === task.id}
            isMultiSelected={selectedTaskIds?.has(task.id) ?? false}
            showCheckbox={isMultiSelectActive}
            onMultiSelect={onMultiSelect}
            depth={depth}
            completedChildCount={stats?.completed ?? 0}
            totalChildCount={stats?.total ?? 0}
            expanded={expandedIds.has(task.id)}
            onToggleExpand={handleToggleExpand}
            onUpdateDueDate={onUpdateDueDate}
            onContextMenu={onContextMenu}
            isBlocked={blockedTaskIds?.has(task.id)}
          />
        );
      })}
    </div>
  );
}
