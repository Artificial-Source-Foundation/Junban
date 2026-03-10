import {
  useGeneralSettings,
  DEFAULT_SETTINGS,
  type GeneralSettings,
} from "../../context/SettingsContext.js";
import { SettingRow, Toggle } from "./components.js";

type FeatureKey = Extract<keyof GeneralSettings, `feature_${string}`>;
type ToggleKey = FeatureKey | "eat_the_frog_enabled" | "nudge_enabled";

interface FeatureEntry {
  key: ToggleKey;
  label: string;
  description: string;
}

interface FeatureGroup {
  title: string;
  description: string;
  features: FeatureEntry[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "Views",
    description: "Additional views in the sidebar",
    features: [
      {
        key: "feature_calendar",
        label: "Calendar",
        description: "View tasks on a calendar",
      },
      {
        key: "feature_completed",
        label: "Completed tasks",
        description: "View completed tasks",
      },
      {
        key: "feature_cancelled",
        label: "Cancelled tasks",
        description: "View and restore cancelled tasks",
      },
      {
        key: "feature_someday",
        label: "Someday / Maybe",
        description: "Park tasks you might do later in a dedicated view",
      },
      {
        key: "feature_matrix",
        label: "Eisenhower Matrix",
        description: "Priority matrix view for urgent/important categorization",
      },
      {
        key: "feature_stats",
        label: "Productivity stats",
        description: "Track completion streaks and daily statistics",
      },
      {
        key: "feature_filters_labels",
        label: "Filters & Labels",
        description: "Saved filters and label management",
      },
      {
        key: "feature_dopamine_menu",
        label: "Quick Wins",
        description: "A fun way to pick easy tasks when you need a quick win",
      },
    ],
  },
  {
    title: "Task Features",
    description: "Enhancements to task management",
    features: [
      {
        key: "feature_sections",
        label: "Project sections",
        description: "Group tasks into named sections within projects",
      },
      {
        key: "feature_kanban",
        label: "Kanban / Board view",
        description: "Drag-and-drop board view for projects with sections",
      },
      {
        key: "feature_duration",
        label: "Time estimates",
        description: "Show duration badges on tasks (e.g. 30m, 1h)",
      },
      {
        key: "feature_deadlines",
        label: "Deadlines",
        description: "Separate hard deadline field distinct from the due date",
      },
      {
        key: "feature_comments",
        label: "Comments & activity",
        description: "Add comments and view activity history on tasks",
      },
    ],
  },
  {
    title: "Productivity",
    description: "Focus and productivity tools",
    features: [
      {
        key: "feature_chords",
        label: "Keyboard chords",
        description: "Multi-key shortcuts like g then i to jump to Inbox",
      },
      {
        key: "eat_the_frog_enabled",
        label: "Eat the Frog",
        description: "Highlight your most-dreaded task each morning",
      },
      {
        key: "nudge_enabled",
        label: "Smart Nudges",
        description: "Contextual reminders about overdue tasks, deadlines, etc.",
      },
    ],
  },
];

/** All feature_* keys across all groups (used for Enable All / Reset). */
const ALL_TOGGLE_KEYS = FEATURE_GROUPS.flatMap((g) => g.features.map((f) => f.key));

export function FeaturesTab() {
  const { settings, loaded, updateSetting } = useGeneralSettings();

  if (!loaded) return null;

  const handleEnableAll = () => {
    for (const key of ALL_TOGGLE_KEYS) {
      updateSetting(key, "true");
    }
  };

  const handleResetToDefaults = () => {
    for (const key of ALL_TOGGLE_KEYS) {
      updateSetting(key, DEFAULT_SETTINGS[key]);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-on-surface-muted">
        Toggle features on or off. Disabled features are hidden from the interface but your data is
        preserved.
      </p>

      {FEATURE_GROUPS.map((group) => (
        <div key={group.title}>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-on-surface">{group.title}</h3>
            <p className="text-xs text-on-surface-muted">{group.description}</p>
          </div>
          <div className="space-y-4 max-w-md">
            {group.features.map(({ key, label, description }) => (
              <SettingRow key={key} label={label} description={description}>
                <Toggle
                  enabled={settings[key] === "true"}
                  onToggle={() => updateSetting(key, settings[key] === "true" ? "false" : "true")}
                />
              </SettingRow>
            ))}
          </div>
          <div className="mt-4 border-b border-border" />
        </div>
      ))}

      <div className="flex gap-3 max-w-md">
        <button
          onClick={handleEnableAll}
          className="px-4 py-2 text-sm rounded-lg border border-border text-on-surface-secondary hover:bg-surface-tertiary transition-colors"
        >
          Enable All
        </button>
        <button
          onClick={handleResetToDefaults}
          className="px-4 py-2 text-sm rounded-lg border border-border text-on-surface-secondary hover:bg-surface-tertiary transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
