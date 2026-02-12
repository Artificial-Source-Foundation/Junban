import React, { useState, useEffect } from "react";

interface Command {
  id: string;
  name: string;
  callback: () => void;
  hotkey?: string;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ commands, isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (command: Command) => {
    command.callback();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command..."
          className="w-full px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none"
          autoFocus
        />
        <ul className="max-h-64 overflow-auto py-1">
          {filtered.map((cmd) => (
            <li key={cmd.id}>
              <button
                onClick={() => handleSelect(cmd)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between"
              >
                <span>{cmd.name}</span>
                {cmd.hotkey && (
                  <span className="text-xs text-gray-400">{cmd.hotkey}</span>
                )}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-2 text-gray-400">No matching commands</li>
          )}
        </ul>
      </div>
    </div>
  );
}
