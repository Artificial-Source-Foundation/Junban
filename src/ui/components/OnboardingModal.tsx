import { useState, useCallback } from "react";
import { CheckCircle2, Sparkles, Type } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to Saydo",
    description: "Your AI-native task manager. Simple, smart, and fully yours.",
    icon: Sparkles,
  },
  {
    title: "Natural Language Input",
    description:
      'Type tasks naturally — "buy milk tomorrow p1 #groceries" creates a task with a due date, priority, and tag.',
    icon: Type,
  },
  {
    title: "You're All Set!",
    description: "Start adding tasks, explore plugins, or set up AI assistance in Settings.",
    icon: CheckCircle2,
  },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [step, onComplete]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  if (!open) return null;

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-surface rounded-xl shadow-2xl border border-border animate-scale-fade-in p-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-accent" : "w-1.5 bg-surface-tertiary"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Icon size={32} className="text-accent" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-lg font-semibold text-on-surface text-center">{currentStep.title}</h2>
        <p className="text-sm text-on-surface-muted text-center mt-2">{currentStep.description}</p>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-4 py-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
