import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { shortcutManager } from "../../shortcutManagerInstance.js";
import { api } from "../../api/index.js";
import { useGeneralSettings } from "../../context/SettingsContext.js";
import { SettingRow, Toggle } from "./components.js";
import { StartupSection } from "./general/StartupSection.js";

export function KeyboardTab() {
  const { settings, updateSetting } = useGeneralSettings();
  const [shortcuts, setShortcuts] = useState(shortcutManager.getAll());
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conflictForId, setConflictForId] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState("");

  useEffect(() => {
    return shortcutManager.subscribe(() => {
      setShortcuts(shortcutManager.getAll());
    });
  }, []);

  useEffect(() => {
    if (!recordingId) return;

    // Clear any existing conflict when starting a new recording
    setConflictForId(null);
    setConflictMessage("");

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Skip modifier-only keys
      if (["Control", "Meta", "Alt", "Shift"].includes(e.key)) return;

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("ctrl");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");

      let key = e.key.toLowerCase();
      if (key === " ") key = "space";
      if (key === "escape") {
        setRecordingId(null);
        return;
      }
      parts.push(key);

      const combo = parts.join("+");
      const result = shortcutManager.rebind(recordingId, combo);
      if (result.ok) {
        const json = shortcutManager.toJSON();
        api.setAppSetting("keyboard_shortcuts", JSON.stringify(json));
      } else if ("conflict" in result && result.conflict) {
        setConflictForId(recordingId);
        setConflictMessage(`"${combo}" is already used by "${result.conflict}"`);
      }
      setRecordingId(null);
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [recordingId]);

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return shortcuts;
    const q = searchQuery.toLowerCase();
    return shortcuts.filter(
      (s) => s.description.toLowerCase().includes(q) || s.currentKey.toLowerCase().includes(q),
    );
  }, [shortcuts, searchQuery]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3 text-on-surface">Keyboard Behavior</h2>
        <div className="space-y-4 max-w-md">
          <SettingRow
            label="Keyboard chords"
            description="Jump around the app with multi-key shortcuts like g then i"
          >
            <Toggle
              enabled={settings.feature_chords === "true"}
              onToggle={() =>
                updateSetting(
                  "feature_chords",
                  settings.feature_chords === "true" ? "false" : "true",
                )
              }
            />
          </SettingRow>
        </div>
      </section>

      <StartupSection />

      <section>
        <h2 className="text-lg font-semibold mb-3 text-on-surface">Keyboard Shortcuts</h2>

        <div className="relative max-w-lg mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted"
          />
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface placeholder-on-surface-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="space-y-2 max-w-lg">
          {filteredShortcuts.length === 0 ? (
            <p className="text-sm text-on-surface-muted py-4">No shortcuts match your search.</p>
          ) : (
            filteredShortcuts.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-on-surface-secondary">{s.description}</span>
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`px-2 py-0.5 text-xs rounded border ${
                        recordingId === s.id
                          ? "border-accent bg-accent/10 text-accent animate-pulse"
                          : "border-border bg-surface-secondary text-on-surface-secondary"
                      }`}
                    >
                      {recordingId === s.id ? "Press keys..." : s.currentKey}
                    </kbd>
                    <button
                      onClick={() => setRecordingId(recordingId === s.id ? null : s.id)}
                      className="text-xs text-accent hover:text-accent-hover"
                    >
                      {recordingId === s.id ? "Cancel" : "Edit"}
                    </button>
                    {s.currentKey !== s.defaultKey && (
                      <button
                        onClick={() => {
                          shortcutManager.resetToDefault(s.id);
                          const json = shortcutManager.toJSON();
                          api.setAppSetting("keyboard_shortcuts", JSON.stringify(json));
                          if (conflictForId === s.id) {
                            setConflictForId(null);
                            setConflictMessage("");
                          }
                        }}
                        className="text-xs text-on-surface-muted hover:text-on-surface-secondary"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                {conflictForId === s.id && conflictMessage && (
                  <p className="text-warning text-xs mt-0.5 mb-1">{conflictMessage}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
