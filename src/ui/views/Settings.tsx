import React from "react";

export function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">General</h2>
        {/* TODO: Theme selection, storage mode, locale */}
        <p className="text-gray-500">General settings coming soon.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Plugins</h2>
        {/* TODO: Plugin list with enable/disable toggles */}
        <p className="text-gray-500">Plugin management coming soon.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h2>
        {/* TODO: Shortcut customization */}
        <p className="text-gray-500">Shortcut customization coming soon.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Data</h2>
        {/* TODO: Export, import, storage info */}
        <p className="text-gray-500">Data management coming soon.</p>
      </section>
    </div>
  );
}
