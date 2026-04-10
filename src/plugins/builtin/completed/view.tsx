import { Completed } from "../../../ui/views/Completed.js";
import { openTaskDetail, useBuiltinProjects, useBuiltinTaskViewActions } from "../view-runtime.js";

export function CompletedPluginView() {
  const projects = useBuiltinProjects();
  const { tasks } = useBuiltinTaskViewActions(projects);

  return <Completed tasks={tasks} projects={projects} onSelectTask={openTaskDetail} />;
}
