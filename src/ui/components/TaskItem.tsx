import type { Task } from "../../core/types.js";
import { getPriority } from "../../core/priorities.js";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export function TaskItem({ task, onToggle, onSelect, isSelected }: TaskItemProps) {
  const priority = task.priority ? getPriority(task.priority) : null;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      onClick={() => onSelect(task.id)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
          task.status === "completed"
            ? "bg-green-500 border-green-500"
            : priority
              ? `border-[${priority.color}]`
              : "border-gray-300 dark:border-gray-600"
        }`}
      />
      <span className={task.status === "completed" ? "line-through text-gray-400" : ""}>
        {task.title}
      </span>
      {task.tags.map((tag) => (
        <span
          key={tag.id}
          className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          {tag.name}
        </span>
      ))}
      {task.dueDate && (
        <span className="text-xs text-gray-500 ml-auto">
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
