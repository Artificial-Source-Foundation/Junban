import React from "react";

export function PluginStore() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Plugin Store</h1>
      <p className="text-gray-500 mb-4">Browse and install community plugins.</p>
      {/* TODO: Fetch from sources.json, display plugin cards */}
      <p className="text-gray-400">Plugin store coming in v0.5.</p>
    </div>
  );
}
