import { useState, useCallback } from "react";
import {
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Snowflake,
  Minus,
  Layers,
  Rocket,
  MessageSquare,
  Lightbulb,
  Command,
  Puzzle,
  Check,
} from "lucide-react";
import { themeManager } from "../themes/manager.js";
import { useGeneralSettings, type GeneralSettings } from "../context/SettingsContext.js";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  onRequestOpenSettings?: (tab: string) => void;
}

const TOTAL_STEPS = 5;

/** Subset of accent colors from the full palette — visually distinct picks. */
const ACCENT_COLORS = [
  "#db4035", // Red
  "#ff9933", // Orange
  "#fad000", // Yellow
  "#299438", // Emerald
  "#158fad", // Teal
  "#14aaf5", // Sky Blue
  "#4073ff", // Blue
  "#884dff", // Grape
] as const;

type Preset = "minimal" | "standard" | "power";

const PRESETS: Record<Preset, Partial<Record<keyof GeneralSettings, string>>> = {
  minimal: {
    feature_calendar: "false",
    feature_filters_labels: "false",
    feature_completed: "false",
    feature_cancelled: "false",
    feature_matrix: "false",
    feature_stats: "false",
    feature_someday: "false",
    feature_chords: "false",
    feature_dopamine_menu: "false",
    eat_the_frog_enabled: "false",
    nudge_enabled: "false",
  },
  standard: {
    feature_calendar: "true",
    feature_filters_labels: "false",
    feature_completed: "true",
    feature_cancelled: "false",
    feature_matrix: "false",
    feature_stats: "true",
    feature_someday: "true",
    feature_chords: "false",
    feature_dopamine_menu: "false",
    eat_the_frog_enabled: "false",
    nudge_enabled: "true",
    nudge_overdue_alert: "true",
    nudge_deadline_approaching: "true",
    nudge_stale_tasks: "false",
    nudge_empty_today: "false",
    nudge_overloaded_day: "false",
  },
  power: {
    feature_calendar: "true",
    feature_filters_labels: "true",
    feature_completed: "true",
    feature_cancelled: "true",
    feature_matrix: "true",
    feature_stats: "true",
    feature_someday: "true",
    feature_chords: "true",
    feature_dopamine_menu: "true",
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

const PRESET_OPTIONS: { key: Preset; label: string; description: string; icon: typeof Minus }[] = [
  {
    key: "minimal",
    label: "Minimal",
    description: "Just the essentials \u2014 Inbox, Today, Upcoming",
    icon: Minus,
  },
  {
    key: "standard",
    label: "Standard",
    description: "Core views plus calendar, completed tasks, and stats",
    icon: Layers,
  },
  {
    key: "power",
    label: "Everything",
    description: "All views and productivity features enabled",
    icon: Rocket,
  },
];

const THEME_OPTIONS: {
  id: "light" | "dark" | "nord";
  label: string;
  icon: typeof Sun;
  bgClass: string;
  barClasses: string[];
}[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    bgClass: "bg-white",
    barClasses: ["bg-gray-200", "bg-gray-300", "bg-gray-200"],
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    bgClass: "bg-gray-800",
    barClasses: ["bg-gray-600", "bg-gray-700", "bg-gray-600"],
  },
  {
    id: "nord",
    label: "Nord",
    icon: Snowflake,
    bgClass: "bg-[#2e3440]",
    barClasses: ["bg-[#4c566a]", "bg-[#434c5e]", "bg-[#4c566a]"],
  },
];

export function OnboardingModal({ open, onComplete, onRequestOpenSettings }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "nord">("light");
  const [selectedAccent, setSelectedAccent] = useState("#3b82f6");
  const [selectedPreset, setSelectedPreset] = useState<Preset>("minimal");
  const [wantsAI, setWantsAI] = useState(false);

  const { updateSetting } = useGeneralSettings();

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleThemeSelect = useCallback(
    (themeId: "light" | "dark" | "nord") => {
      setSelectedTheme(themeId);
      themeManager.setTheme(themeId);
    },
    [],
  );

  const handleAccentSelect = useCallback(
    (color: string) => {
      setSelectedAccent(color);
      updateSetting("accent_color", color);
    },
    [updateSetting],
  );

  const handleFinish = useCallback(() => {
    // Apply preset feature flags
    const preset = PRESETS[selectedPreset];
    for (const [key, value] of Object.entries(preset)) {
      updateSetting(key as keyof GeneralSettings, value as GeneralSettings[keyof GeneralSettings]);
    }

    // Theme and accent are already applied live, but ensure they're persisted
    themeManager.setTheme(selectedTheme);
    updateSetting("accent_color", selectedAccent);

    onComplete();

    if (wantsAI) {
      onRequestOpenSettings?.("ai");
    }
  }, [selectedPreset, selectedTheme, selectedAccent, wantsAI, updateSetting, onComplete, onRequestOpenSettings]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-surface rounded-xl shadow-2xl border border-border animate-scale-fade-in p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-accent" : "w-1.5 bg-surface-tertiary"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        {step === 0 && <StepWelcome />}
        {step === 1 && (
          <StepTheme
            selectedTheme={selectedTheme}
            selectedAccent={selectedAccent}
            onThemeSelect={handleThemeSelect}
            onAccentSelect={handleAccentSelect}
          />
        )}
        {step === 2 && (
          <StepPreset selectedPreset={selectedPreset} onPresetSelect={setSelectedPreset} />
        )}
        {step === 3 && <StepAI onSetWantsAI={setWantsAI} onNext={handleNext} />}
        {step === 4 && <StepReady />}

        {/* Actions */}
        <div className="flex justify-between mt-8">
          {step === 0 ? (
            <div />
          ) : step === 3 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
            >
              Back
            </button>
          )}

          {step === 0 && (
            <button
              onClick={handleNext}
              className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Get Started
            </button>
          )}
          {step === 1 && (
            <button
              onClick={handleNext}
              className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleNext}
              className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Next
            </button>
          )}
          {/* Step 3 has its own buttons inside StepAI */}
          {step === 3 && <div />}
          {step === 4 && (
            <button
              onClick={handleFinish}
              className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Start using Saydo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

function StepWelcome() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center shadow-[0_0_24px_rgba(var(--accent-rgb,59,130,246),0.2)]">
          <Sparkles size={32} className="text-accent" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-on-surface">Welcome to Saydo</h2>
      <p className="text-sm text-on-surface-muted mt-2">
        Your task manager. Simple, smart, yours.
      </p>
    </div>
  );
}

function StepTheme({
  selectedTheme,
  selectedAccent,
  onThemeSelect,
  onAccentSelect,
}: {
  selectedTheme: "light" | "dark" | "nord";
  selectedAccent: string;
  onThemeSelect: (id: "light" | "dark" | "nord") => void;
  onAccentSelect: (color: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface text-center mb-4">Pick your look</h2>

      {/* Theme cards */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        {THEME_OPTIONS.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`flex-1 rounded-xl border-2 p-3 transition-all hover:scale-[1.02] ${
                isSelected
                  ? "border-accent shadow-md"
                  : "border-border hover:border-on-surface-muted/30"
              }`}
            >
              {/* Mini preview */}
              <div
                className={`${theme.bgClass} rounded-lg p-3 mb-2 h-[72px] flex flex-col justify-center gap-1.5`}
              >
                {theme.barClasses.map((barClass, i) => (
                  <div
                    key={i}
                    className={`${barClass} rounded h-2`}
                    style={{ width: `${85 - i * 15}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-on-surface">
                <Icon size={14} />
                <span>{theme.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Accent color picker */}
      <div>
        <p className="text-sm text-on-surface-muted mb-2 text-center">Accent color</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onAccentSelect(color)}
              aria-label={`Accent color ${color}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedAccent === color
                  ? "ring-2 ring-offset-2 ring-offset-surface ring-on-surface"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
            >
              {selectedAccent === color && (
                <Check size={14} className="text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPreset({
  selectedPreset,
  onPresetSelect,
}: {
  selectedPreset: Preset;
  onPresetSelect: (preset: Preset) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface text-center mb-4">
        How much do you want to see?
      </h2>
      <div className="space-y-3">
        {PRESET_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPreset === option.key;
          return (
            <button
              key={option.key}
              onClick={() => onPresetSelect(option.key)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-on-surface-muted/30"
              }`}
            >
              {/* Radio dot */}
              <div
                className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? "border-accent" : "border-on-surface-muted/40"
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-accent" />}
              </div>

              <div className="flex items-start gap-2 min-w-0">
                <Icon
                  size={18}
                  className={`mt-0.5 flex-shrink-0 ${isSelected ? "text-accent" : "text-on-surface-muted"}`}
                />
                <div>
                  <p className="text-sm font-medium text-on-surface">{option.label}</p>
                  <p className="text-xs text-on-surface-muted mt-0.5">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepAI({
  onSetWantsAI,
  onNext,
}: {
  onSetWantsAI: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold text-on-surface mb-1">AI Assistant</h2>
      <p className="text-sm text-on-surface-muted mb-5">
        Saydo has a built-in AI that can help manage your tasks. You can set this up now or later in
        Settings.
      </p>

      {/* Decorative AI chat preview */}
      <div className="mx-auto max-w-[280px] rounded-xl border border-border bg-surface-secondary p-3 mb-6">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <MessageSquare size={14} className="text-accent" />
          <span className="text-xs font-medium text-on-surface-muted">AI Chat</span>
        </div>
        <div className="space-y-2 text-left">
          <div className="bg-accent/10 rounded-lg px-2.5 py-1.5 text-xs text-on-surface w-fit">
            Plan my day
          </div>
          <div className="bg-surface rounded-lg px-2.5 py-1.5 text-xs text-on-surface-muted ml-auto w-fit max-w-[200px]">
            Here are your top 3 tasks for today...
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            onSetWantsAI(true);
            onNext();
          }}
          className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          I&apos;ll configure it now
        </button>
        <button
          onClick={() => {
            onSetWantsAI(false);
            onNext();
          }}
          className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
        >
          Set up later
        </button>
      </div>
    </div>
  );
}

function StepReady() {
  const tips = [
    {
      icon: Lightbulb,
      text: "Type naturally: \"buy milk tomorrow p1 #groceries\"",
    },
    {
      icon: Command,
      text: "Press Ctrl+K for the command palette",
    },
    {
      icon: Puzzle,
      text: "Explore plugins in Settings for more power",
    },
  ];

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-on-surface">You&apos;re all set!</h2>
      <p className="text-sm text-on-surface-muted mt-2 mb-5">
        Start adding tasks. Discover more features anytime in Settings.
      </p>
      <div className="space-y-2">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.text}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-secondary text-left"
            >
              <Icon size={16} className="text-accent flex-shrink-0" />
              <span className="text-xs text-on-surface">{tip.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
