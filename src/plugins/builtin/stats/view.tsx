import { Stats } from "../../../ui/views/Stats.js";
import { useTaskContext } from "../../../ui/context/TaskContext.js";

export function StatsPluginView() {
  const { state } = useTaskContext();
  return <Stats tasks={state.tasks} />;
}
