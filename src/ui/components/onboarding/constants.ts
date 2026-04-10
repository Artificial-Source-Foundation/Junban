import { Sun, Moon, Snowflake, Minus, Layers, Rocket } from "lucide-react";
import type { ThemeOption, PresetOption, PresetSettings } from "./types.js";

/** Subset of accent colors — visually distinct, matching the design. */
export const ACCENT_COLORS = [
  "#3b82f6", // Blue (default)
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EF4444", // Red
  "#F97316", // Orange
  "#06B6D4", // Cyan
] as const;

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    iconColor: "text-amber-400",
    cardBg: "bg-white",
    labelColor: "text-gray-900",
    mockBg: "bg-gray-100",
    barColor: "bg-gray-300",
    accentBar: "bg-blue-500",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    iconColor: "text-violet-400",
    cardBg: "bg-[#1E1E2E]",
    labelColor: "text-gray-200",
    mockBg: "bg-[#2A2A3C]",
    barColor: "bg-gray-600",
    accentBar: "bg-violet-400",
  },
  {
    id: "nord",
    label: "Nord",
    icon: Snowflake,
    iconColor: "text-[#88C0D0]",
    cardBg: "bg-[#2E3440]",
    labelColor: "text-[#ECEFF4]",
    mockBg: "bg-[#3B4252]",
    barColor: "bg-[#4C566A]",
    accentBar: "bg-[#88C0D0]",
  },
];

export const PRESET_OPTIONS: PresetOption[] = [
  {
    key: "minimal",
    label: "Minimal",
    description: "Recommended to start: just Inbox, Today, and Upcoming",
    icon: Minus,
  },
  {
    key: "standard",
    label: "Standard",
    description: "Adds a few planning views once you are ready for more",
    icon: Layers,
  },
  {
    key: "power",
    label: "Everything",
    description: "Turns on all optional views and workflow extras",
    icon: Rocket,
  },
];

export const PRESETS: PresetSettings = {
  minimal: {
    feature_filters_labels: "false",
    feature_chords: "false",
    eat_the_frog_enabled: "false",
    nudge_enabled: "false",
  },
  standard: {
    feature_filters_labels: "false",
    feature_chords: "false",
    eat_the_frog_enabled: "false",
    nudge_enabled: "true",
    nudge_overdue_alert: "true",
    nudge_deadline_approaching: "true",
    nudge_stale_tasks: "false",
    nudge_empty_today: "false",
    nudge_overloaded_day: "false",
  },
  power: {
    feature_filters_labels: "true",
    feature_chords: "true",
    eat_the_frog_enabled: "true",
    eat_the_frog_morning_only: "true",
    nudge_enabled: "true",
    nudge_overdue_alert: "true",
    nudge_deadline_approaching: "true",
    nudge_stale_tasks: "true",
    nudge_empty_today: "true",
    nudge_overloaded_day: "true",
  },
} as const;

export const PRESET_BUILTIN_PLUGINS = {
  minimal: [],
  standard: ["calendar", "completed", "stats", "someday"],
  power: ["calendar", "completed", "cancelled", "matrix", "stats", "someday", "dopamine-menu"],
} as const;

export const TOTAL_STEPS = 5;
