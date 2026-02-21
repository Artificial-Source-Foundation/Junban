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
