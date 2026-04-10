import { Matrix } from "../../../ui/views/Matrix.js";
import { openTaskDetail, useBuiltinProjects, useBuiltinTaskViewActions } from "../view-runtime.js";

export function MatrixPluginView() {
  const projects = useBuiltinProjects();
  const { tasks, handleToggleTask, updateTask } = useBuiltinTaskViewActions(projects);

  return (
    <Matrix
      tasks={tasks}
      onToggleTask={handleToggleTask}
      onSelectTask={openTaskDetail}
      onUpdateTask={updateTask}
      selectedTaskId={null}
    />
  );
}
