interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAV_ITEMS = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "today", label: "Today", icon: "calendar" },
  { id: "upcoming", label: "Upcoming", icon: "clock" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Docket</h2>
      <nav className="flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  currentView === item.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* TODO: Project list */}
      {/* TODO: Plugin panels */}
    </aside>
  );
}
