import { Calendar } from "../../../ui/views/Calendar.js";
import { openTaskDetail, useBuiltinProjects, useBuiltinTaskViewActions } from "../view-runtime.js";

export function CalendarPluginView() {
  const projects = useBuiltinProjects();
  const { tasks, handleToggleTask } = useBuiltinTaskViewActions(projects);

  return (
    <Calendar
      tasks={tasks}
      projects={projects}
      onSelectTask={openTaskDetail}
      onToggleTask={handleToggleTask}
    />
  );
}
