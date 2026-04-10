import {
  useGeneralSettings,
  DEFAULT_SETTINGS,
  type GeneralSettings,
} from "../../context/SettingsContext.js";
import { NudgeSection } from "./general/NudgeSection.js";
import { NotificationSection } from "./general/NotificationSection.js";
import { SoundSection } from "./general/SoundSection.js";
import { StartupSection } from "./general/StartupSection.js";
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
    title: "Extra Views",
    description: "Optional screens you may want once your workflow grows beyond the basics",
    features: [
      {
        key: "feature_filters_labels",
        label: "Filters & Labels",
        description: "Saved filters and label organization in one place",
      },
    ],
  },
  {
    title: "Workflow Options",
    description: "More structure and planning detail for people who want a richer setup",
    features: [
      {
        key: "feature_sections",
        label: "Project sections",
        description: "Group tasks inside projects with named sections",
      },
      {
        key: "feature_kanban",
        label: "Kanban / Board view",
        description: "Use a drag-and-drop board layout inside projects",
      },
      {
        key: "feature_duration",
        label: "Time estimates",
        description: "Track rough time estimates like 30m or 1h on tasks",
      },
      {
        key: "feature_deadlines",
        label: "Deadlines",
        description: "Add a hard deadline separate from the normal due date",
      },
      {
        key: "feature_comments",
        label: "Comments & activity",
        description: "Keep notes and see task activity history",
      },
    ],
  },
  {
    title: "Power Tools",
    description: "Helpful extras for people who want more automation, prompts, or keyboard speed",
    features: [
      {
        key: "feature_chords",
        label: "Keyboard chords",
        description: "Jump around the app with multi-key shortcuts like g then i",
      },
      {
        key: "eat_the_frog_enabled",
        label: "Eat the Frog",
        description: "Highlight the hardest task to tackle first",
      },
      {
        key: "nudge_enabled",
        label: "Smart Nudges",
        description: "Show lightweight reminders based on what is falling behind",
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
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-on-surface">Advanced</h2>
        <p className="mt-1 text-sm text-on-surface-muted">
          Optional upgrades for desktop use, planning depth, and power-user workflows. Turn them on
          only when you need them. Your data stays intact when they are off.
        </p>
      </div>

      <StartupSection />
      <SoundSection />
      <NotificationSection />
      <NudgeSection />

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
          Turn On All
        </button>
        <button
          onClick={handleResetToDefaults}
          className="px-4 py-2 text-sm rounded-lg border border-border text-on-surface-secondary hover:bg-surface-tertiary transition-colors"
        >
          Restore Defaults
        </button>
      </div>
    </div>
  );
}
