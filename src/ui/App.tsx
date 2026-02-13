import { useState } from "react";
import { Sidebar } from "./components/Sidebar.js";
import { TaskProvider, useTaskContext } from "./context/TaskContext.js";
import { Inbox } from "./views/Inbox.js";
import { Today } from "./views/Today.js";
import { Upcoming } from "./views/Upcoming.js";

type View = "inbox" | "today" | "upcoming" | "project" | "settings";

function AppContent() {
  const [currentView, setCurrentView] = useState<View>("inbox");
  const { state, createTask, completeTask } = useTaskContext();

  const handleCreateTask = async (parsed: {
    title: string;
    priority: number | null;
    tags: string[];
    project: string | null;
    dueDate: Date | null;
    dueTime: boolean;
  }) => {
    await createTask({
      title: parsed.title,
      priority: parsed.priority,
      dueDate: parsed.dueDate?.toISOString() ?? null,
      dueTime: parsed.dueTime,
      tags: parsed.tags,
      projectId: null,
    });
  };

  const handleToggleTask = async (id: string) => {
    await completeTask(id);
  };

  const handleSelectTask = (_id: string) => {
    // TODO: Open task detail panel (Sprint 2, U-12)
  };

  const renderView = () => {
    switch (currentView) {
      case "inbox":
        return (
          <Inbox
            tasks={state.tasks}
            onCreateTask={handleCreateTask}
            onToggleTask={handleToggleTask}
            onSelectTask={handleSelectTask}
          />
        );
      case "today":
        return (
          <Today
            tasks={state.tasks}
            onToggleTask={handleToggleTask}
            onSelectTask={handleSelectTask}
          />
        );
      case "upcoming":
        return (
          <Upcoming
            tasks={state.tasks}
            onToggleTask={handleToggleTask}
            onSelectTask={handleSelectTask}
          />
        );
      default:
        return (
          <div>
            <h1 className="text-2xl font-bold">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h1>
            <p className="text-gray-500 mt-2">View content coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar currentView={currentView} onNavigate={(v) => setCurrentView(v as View)} />
      <main className="flex-1 overflow-auto p-6">
        {state.loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : state.error ? (
          <p className="text-red-500">Error: {state.error}</p>
        ) : (
          renderView()
        )}
      </main>
    </div>
  );
}

export function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
