import { Cancelled } from "../../../ui/views/Cancelled.js";
import { openTaskDetail, useBuiltinProjects, useBuiltinTaskViewActions } from "../view-runtime.js";

export function CancelledPluginView() {
  const projects = useBuiltinProjects();
  const { tasks, restoreTask } = useBuiltinTaskViewActions(projects);

  return (
    <Cancelled
      tasks={tasks}
      projects={projects}
      onSelectTask={openTaskDetail}
      onRestoreTask={(taskId) => {
        void restoreTask(taskId);
      }}
    />
  );
}
