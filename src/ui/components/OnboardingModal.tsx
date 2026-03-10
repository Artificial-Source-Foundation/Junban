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
  Bot,
  Type,
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

/** Subset of accent colors — visually distinct, matching the design. */
const ACCENT_COLORS = [
  "#3b82f6", // Blue (default)
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EF4444", // Red
  "#F97316", // Orange
  "#06B6D4", // Cyan
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
  iconColor: string;
  cardBg: string;
  labelColor: string;
  mockBg: string;
  barColor: string;
  accentBar: string;
}[] = [
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
      <div className="w-full max-w-lg mx-4 bg-surface rounded-[20px] shadow-2xl border border-border animate-scale-fade-in px-9 py-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
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

        {/* Actions — Step 0: centered button, Steps 1-2: Back/Next, Step 3: own buttons, Step 4: centered finish */}
        <div className="flex justify-between items-center mt-8">
          {step === 0 && (
            <>
              <div />
              <button
                onClick={handleNext}
                className="px-8 py-2.5 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
              >
                Get Started
              </button>
              <div />
            </>
          )}
          {(step === 1 || step === 2) && (
            <>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2.5 text-sm font-semibold bg-accent text-white rounded-[10px] hover:bg-accent/90 transition-colors"
              >
                Next
              </button>
            </>
          )}
          {/* Step 3 has its own buttons inside StepAI */}
          {step === 3 && (
            <>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
              >
                Back
              </button>
              <div />
            </>
          )}
          {step === 4 && (
            <>
              <div />
              <button
                onClick={handleFinish}
                className="px-8 py-2.5 text-[15px] font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
              >
                Start using Saydo
              </button>
              <div />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

function StepWelcome() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-[72px] h-[72px] rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Sparkles size={36} className="text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface font-[Plus_Jakarta_Sans,sans-serif]">
        Welcome to Saydo
      </h2>
      <p className="text-[15px] text-on-surface-muted mt-2 max-w-xs">
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
      <h2 className="text-[22px] font-bold text-on-surface text-center font-[Plus_Jakarta_Sans,sans-serif]">
        Pick your look
      </h2>
      <p className="text-sm text-on-surface-muted text-center mt-1 mb-6">
        Choose a theme and accent color
      </p>

      {/* Theme cards */}
      <div className="flex gap-3 justify-center mb-5">
        {THEME_OPTIONS.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`w-[130px] rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] ${theme.cardBg} ${
                isSelected
                  ? "border-accent shadow-md"
                  : "border-transparent hover:border-on-surface-muted/20"
              }`}
            >
              <Icon size={28} className={theme.iconColor} />
              <span className={`text-sm font-semibold ${theme.labelColor}`}>{theme.label}</span>
              {/* Mini mock with 3 bars */}
              <div className={`w-[90px] ${theme.mockBg} rounded-lg p-1.5 flex flex-col gap-1`}>
                <div className={`${theme.barColor} rounded-sm h-1.5 w-full`} />
                <div className={`${theme.barColor} rounded-sm h-1.5 w-[65%]`} />
                <div className={`${theme.accentBar} rounded-sm h-1.5 w-[45%]`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Accent color picker */}
      <div>
        <p className="text-[13px] font-medium text-on-surface-muted mb-2.5">Accent color</p>
        <div className="flex items-center gap-2.5 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onAccentSelect(color)}
              aria-label={`Accent color ${color}`}
              className={`rounded-full flex items-center justify-center transition-all ${
                selectedAccent === color
                  ? "w-8 h-8 ring-2 ring-offset-2 ring-offset-surface ring-current"
                  : "w-7 h-7 hover:scale-110"
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
      <h2 className="text-[22px] font-bold text-on-surface text-center font-[Plus_Jakarta_Sans,sans-serif]">
        How much do you want to see?
      </h2>
      <p className="text-sm text-on-surface-muted text-center mt-1 mb-6">
        You can always change this in Settings
      </p>
      <div className="space-y-3">
        {PRESET_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPreset === option.key;
          return (
            <button
              key={option.key}
              onClick={() => onPresetSelect(option.key)}
              className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-[14px] border-2 text-left transition-all hover:scale-[1.01] ${
                isSelected
                  ? "border-accent"
                  : "border-border hover:border-on-surface-muted/30"
              }`}
            >
              {/* Radio dot */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? "border-[6px] border-accent bg-white"
                    : "border-2 border-on-surface-muted/30 bg-white"
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-on-surface">{option.label}</p>
                <p className="text-[13px] text-on-surface-muted mt-0.5">{option.description}</p>
              </div>

              <Icon
                size={20}
                className={`flex-shrink-0 ${isSelected ? "text-accent" : "text-on-surface-muted"}`}
              />
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
    <div>
      <h2 className="text-[22px] font-bold text-on-surface text-center font-[Plus_Jakarta_Sans,sans-serif]">
        AI Assistant
      </h2>
      <p className="text-sm text-on-surface-muted text-center mt-1 mb-6 leading-relaxed">
        Saydo has a built-in AI that can help manage your tasks. Set this up now or later in Settings.
      </p>

      {/* Chat preview — bubble style matching design */}
      <div className="rounded-[14px] bg-surface-secondary p-4 mb-6 space-y-2.5">
        {/* Bot message */}
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-white" />
          </div>
          <div className="bg-surface rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl px-3.5 py-2.5 max-w-[280px]">
            <p className="text-[13px] text-on-surface leading-snug">
              Good morning! You have 3 tasks due today. Want me to help prioritize them?
            </p>
          </div>
        </div>
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-accent rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl px-3.5 py-2.5">
            <p className="text-[13px] text-white">Yes, plan my day!</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => {
            onSetWantsAI(true);
            onNext();
          }}
          className="w-full py-2.5 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
        >
          I&apos;ll configure it now
        </button>
        <button
          onClick={() => {
            onSetWantsAI(false);
            onNext();
          }}
          className="w-full py-2.5 text-sm font-medium text-on-surface-muted bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors"
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
      icon: Type,
      text: 'Type naturally: "buy milk tomorrow p1 #groceries"',
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
    <div className="flex flex-col items-center text-center">
      <div className="w-[72px] h-[72px] rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
        <CheckCircle2 size={36} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface font-[Plus_Jakarta_Sans,sans-serif]">
        You&apos;re all set!
      </h2>
      <p className="text-sm text-on-surface-muted mt-1.5 mb-6 max-w-xs leading-relaxed">
        Start adding tasks. Discover more features anytime in Settings.
      </p>
      <div className="w-full space-y-2">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.text}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-surface-secondary text-left"
            >
              <Icon size={18} className="text-accent flex-shrink-0" />
              <span className="text-xs text-on-surface-secondary">{tip.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
