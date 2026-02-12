import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar.js";

type View = "inbox" | "today" | "upcoming" | "project" | "settings";

export function App() {
  const [currentView, setCurrentView] = useState<View>("inbox");

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-auto p-6">
        {/* TODO: Render current view */}
        <h1 className="text-2xl font-bold">
          {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
        </h1>
        <p className="text-gray-500 mt-2">View content coming soon.</p>
      </main>
    </div>
  );
}
