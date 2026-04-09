import type { View } from "../hooks/useRouting.js";

interface SkeletonLineProps {
  width?: string;
  height?: string;
}

export function SkeletonLine({ width = "100%", height = "0.75rem" }: SkeletonLineProps) {
  return (
    <div
      className="animate-pulse bg-surface-tertiary rounded"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonTaskItem() {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 border-b border-border/30"
      role="status"
      aria-busy="true"
      aria-label="Loading task"
    >
      <div className="w-5 h-5 rounded-full animate-pulse bg-surface-tertiary flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="60%" height="0.875rem" />
        <SkeletonLine width="35%" height="0.625rem" />
      </div>
    </div>
  );
}

interface SkeletonTaskListProps {
  count?: number;
}

export function SkeletonTaskList({ count = 5 }: SkeletonTaskListProps) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonTaskItem key={i} />
      ))}
    </div>
  );
}

interface ViewSkeletonProps {
  view: View;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-surface-secondary/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ViewSkeleton({ view }: ViewSkeletonProps) {
  const showSidebarCards =
    view === "today" ||
    view === "calendar" ||
    view === "stats" ||
    view === "matrix" ||
    view === "filters-labels";
  const taskCount = view === "today" || view === "upcoming" ? 6 : 5;

  return (
    <div className="flex-1" role="status" aria-busy="true" aria-label={`Loading ${view} view`}>
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 animate-pulse rounded-lg bg-surface-tertiary"
            aria-hidden="true"
          />
          <SkeletonLine width="8rem" height="1.5rem" />
          <SkeletonLine width="4rem" height="0.875rem" />
        </div>
        <SkeletonCard className="h-12 w-full max-w-2xl" />
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border/40 bg-surface/60">
          <SkeletonTaskList count={taskCount} />
        </div>
        {showSidebarCards ? (
          <div className="hidden space-y-4 lg:block">
            <SkeletonCard className="h-32 w-full" />
            <SkeletonCard className="h-40 w-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
