import { Someday } from "../../../ui/views/Someday.js";
import { openTaskDetail, useBuiltinProjects, useBuiltinTaskViewActions } from "../view-runtime.js";

export function SomedayPluginView() {
  const projects = useBuiltinProjects();
  const { tasks, activateSomedayTask } = useBuiltinTaskViewActions(projects);

  return (
    <Someday
      tasks={tasks}
      onSelectTask={openTaskDetail}
      onActivateTask={(taskId) => {
        void activateSomedayTask(taskId);
      }}
    />
  );
}
