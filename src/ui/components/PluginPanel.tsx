import React from "react";

interface PluginPanelProps {
  pluginId: string;
  title: string;
  children: React.ReactNode;
}

/** Container for plugin-rendered sidebar panels. */
export function PluginPanel({ pluginId, title, children }: PluginPanelProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <div data-plugin-id={pluginId}>{children}</div>
    </div>
  );
}
