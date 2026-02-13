import { useState } from "react";
import { themeManager } from "../themes/manager.js";

export function Settings() {
  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrent());

  const handleThemeChange = (themeId: string) => {
    themeManager.setTheme(themeId);
    setCurrentTheme(themeId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange("light")}
            className={`px-4 py-2 rounded-lg border ${
              currentTheme === "light"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className={`px-4 py-2 rounded-lg border ${
              currentTheme === "dark"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Dark
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Plugins</h2>
        <p className="text-gray-500">Plugin management coming soon.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h2>
        <p className="text-gray-500">Shortcut customization coming soon.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Data</h2>
        <p className="text-gray-500">Data management coming soon.</p>
      </section>
    </div>
  );
}
