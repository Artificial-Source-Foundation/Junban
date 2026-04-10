import { DopamineMenu } from "../../../ui/views/DopamineMenu.js";
import { openTaskDetail, useBuiltinProjects, useBuiltinTaskViewActions } from "../view-runtime.js";

export function DopamineMenuPluginView() {
  const projects = useBuiltinProjects();
  const {
    tasks,
    handleToggleTask,
    handleReorder,
    handleAddSubtask,
    handleUpdateDueDate,
  } = useBuiltinTaskViewActions(projects);

  return (
    <DopamineMenu
      tasks={tasks}
      onToggleTask={handleToggleTask}
      onSelectTask={openTaskDetail}
      selectedTaskId={null}
      onReorder={handleReorder}
      onAddSubtask={handleAddSubtask}
      onUpdateDueDate={handleUpdateDueDate}
    />
  );
}
