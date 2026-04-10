import { useEffect, useState } from "react";
import type { Project, UpdateTaskInput } from "../../core/types.js";
import { listProjects } from "../../ui/api/projects.js";
import { useTaskContext } from "../../ui/context/TaskContext.js";
import { useTaskHandlers } from "../../ui/hooks/useTaskHandlers.js";

export function openTaskDetail(taskId: string): void {
  window.dispatchEvent(new CustomEvent("junban:open-task-detail", { detail: { taskId } }));
}

export function useBuiltinProjects(): Project[] {
  const { state } = useTaskContext();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let cancelled = false;

    listProjects()
      .then((items) => {
        if (!cancelled) {
          setProjects(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjects([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.tasks.length]);

  return projects;
}

export function useBuiltinTaskViewActions(projects: Project[]) {
  const { state } = useTaskContext();
  const { handleToggleTask, handleUpdateTask, handleReorder, handleAddSubtask, handleUpdateDueDate } =
    useTaskHandlers(null, projects);

  const restoreTask = async (id: string): Promise<void> => {
    await handleUpdateTask(id, { status: "pending", completedAt: null });
  };

  const activateSomedayTask = async (id: string): Promise<void> => {
    await handleUpdateTask(id, { isSomeday: false });
  };

  const updateTask = async (id: string, changes: UpdateTaskInput): Promise<void> => {
    await handleUpdateTask(id, changes);
  };

  return {
    tasks: state.tasks,
    handleToggleTask,
    handleReorder,
    handleAddSubtask,
    handleUpdateDueDate,
    restoreTask,
    activateSomedayTask,
    updateTask,
  };
}
