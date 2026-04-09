import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatedPresence } from "../AnimatedPresence.js";
import { InlineAddSubtask } from "../InlineAddSubtask.js";
import { TaskItem } from "../TaskItem.js";
import { useReducedMotion } from "../useReducedMotion.js";
import { listItem, staggerContainer } from "../../utils/animation-variants.js";
import {
  ADD_SUBTASK_ROW_HEIGHT,
  ESTIMATED_ROW_HEIGHT,
  VIRTUALIZE_THRESHOLD,
  type TaskListProps,
} from "./TaskListShared.js";
import { TaskListBase, type TaskListBaseRenderContext } from "./TaskListBase.js";
import type { Task } from "../../../core/types.js";

const SortableTaskItem = React.memo(function SortableTaskItem({
  task,
  onToggle,
  onSelect,
  isSelected,
  isMultiSelected,
  showCheckbox,
  onMultiSelect,
  depth,
  completedChildCount,
  totalChildCount,
  expanded,
  onToggleExpand,
  onUpdateDueDate,
  onContextMenu,
  isBlocked,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isMultiSelected: boolean;
  showCheckbox: boolean;
  onMultiSelect?: (
    id: string,
    event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean },
  ) => void;
  depth?: number;
  completedChildCount?: number;
  totalChildCount?: number;
  expanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onUpdateDueDate?: (taskId: string, dueDate: string | null) => void;
  onContextMenu?: (taskId: string, position: { x: number; y: number }) => void;
  isBlocked?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return (
    <TaskItem
      task={task}
      onToggle={onToggle}
      onSelect={onSelect}
      isSelected={isSelected}
      isMultiSelected={isMultiSelected}
      showCheckbox={showCheckbox}
      onMultiSelect={onMultiSelect}
      dragHandleProps={{ ...attributes, ...listeners }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      innerRef={setNodeRef}
      depth={depth}
      completedChildCount={completedChildCount}
      totalChildCount={totalChildCount}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
      onUpdateDueDate={onUpdateDueDate}
      onContextMenu={onContextMenu}
      isBlocked={isBlocked}
    />
  );
});

function VirtualizedTaskRows({
  visibleTasks,
  childStatsMap,
  expandedIds,
  selectedTaskId,
  selectedTaskIds,
  isMultiSelectActive,
  blockedTaskIds,
  handleToggleExpand,
  scrollContainerRef,
  onToggle,
  onSelect,
  onMultiSelect,
  onUpdateDueDate,
  onContextMenu,
  onAddSubtask,
}: TaskListBaseRenderContext & {
  selectedTaskId: string | null;
  selectedTaskIds?: Set<string>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onMultiSelect?: (
    id: string,
    event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean },
  ) => void;
  onUpdateDueDate?: (taskId: string, dueDate: string | null) => void;
  onContextMenu?: (taskId: string, position: { x: number; y: number }) => void;
  onAddSubtask?: (parentId: string, title: string) => void;
}) {
  const virtualizer = useVirtualizer({
    count: visibleTasks.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) =>
      visibleTasks[index]?.showAddSubtask ? ADD_SUBTASK_ROW_HEIGHT : ESTIMATED_ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div
      ref={scrollContainerRef}
      role="list"
      aria-label="Tasks"
      className="overflow-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const entry = visibleTasks[virtualRow.index];
          if (!entry) return null;

          if (entry.showAddSubtask) {
            return (
              <div
                key={`add-subtask-${entry.task.id}`}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <InlineAddSubtask
                  parentId={entry.task.id}
                  depth={entry.depth}
                  onAdd={onAddSubtask!}
                />
              </div>
            );
          }

          const { task, depth } = entry;
          const stats = childStatsMap.get(task.id);

          return (
            <div
              key={task.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <SortableTaskItem
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TaskListEnhanced(props: TaskListProps) {
  const { onReorder, tasks } = props;
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over || active.id === over.id || !onReorder) return;

      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...tasks];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      onReorder(reordered.map((task) => task.id));
    },
    [onReorder, tasks],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
  }, []);

  const activeDragTask = activeDragId
    ? (tasks.find((task) => task.id === activeDragId) ?? null)
    : null;

  return (
    <TaskListBase
      {...props}
      expandedIds={expandedIds}
      onToggleExpand={handleToggleExpand}
      renderList={(context) => {
        const taskIds = context.visibleTasks
          .filter((entry) => !entry.showAddSubtask)
          .map((entry) => entry.task.id);
        const shouldVirtualize = context.visibleTasks.length > VIRTUALIZE_THRESHOLD;

        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              {shouldVirtualize ? (
                <VirtualizedTaskRows
                  {...context}
                  selectedTaskId={props.selectedTaskId}
                  selectedTaskIds={props.selectedTaskIds}
                  scrollContainerRef={scrollContainerRef}
                  onToggle={props.onToggle}
                  onSelect={props.onSelect}
                  onMultiSelect={props.onMultiSelect}
                  onUpdateDueDate={props.onUpdateDueDate}
                  onContextMenu={props.onContextMenu}
                  onAddSubtask={props.onAddSubtask}
                />
              ) : (
                <motion.div
                  role="list"
                  aria-label="Tasks"
                  className="space-y-0"
                  variants={reducedMotion ? undefined : staggerContainer}
                  initial={reducedMotion ? undefined : "initial"}
                  animate="animate"
                >
                  <AnimatedPresence>
                    {context.visibleTasks.map((entry) => {
                      if (entry.showAddSubtask) {
                        return (
                          <InlineAddSubtask
                            key={`add-subtask-${entry.task.id}`}
                            parentId={entry.task.id}
                            depth={entry.depth}
                            onAdd={props.onAddSubtask!}
                          />
                        );
                      }

                      const { task, depth } = entry;
                      const stats = context.childStatsMap.get(task.id);
                      return (
                        <motion.div
                          key={task.id}
                          variants={reducedMotion ? undefined : listItem}
                          initial={reducedMotion ? undefined : "initial"}
                          animate="animate"
                          exit="exit"
                          layout={!reducedMotion}
                        >
                          <SortableTaskItem
                            task={task}
                            onToggle={props.onToggle}
                            onSelect={props.onSelect}
                            isSelected={props.selectedTaskId === task.id}
                            isMultiSelected={props.selectedTaskIds?.has(task.id) ?? false}
                            showCheckbox={context.isMultiSelectActive}
                            onMultiSelect={props.onMultiSelect}
                            depth={depth}
                            completedChildCount={stats?.completed ?? 0}
                            totalChildCount={stats?.total ?? 0}
                            expanded={context.expandedIds.has(task.id)}
                            onToggleExpand={context.handleToggleExpand}
                            onUpdateDueDate={props.onUpdateDueDate}
                            onContextMenu={props.onContextMenu}
                            isBlocked={context.blockedTaskIds?.has(task.id)}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatedPresence>
                </motion.div>
              )}
            </SortableContext>
            <DragOverlay>
              {activeDragTask ? (
                <div className="opacity-80 shadow-lg rounded-lg rotate-1 bg-surface border border-accent/30">
                  <TaskItem
                    task={activeDragTask}
                    onToggle={() => {}}
                    onSelect={() => {}}
                    isSelected={false}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        );
      }}
    />
  );
}
