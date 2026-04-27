import { NotificationSection } from "./general/NotificationSection.js";
import { NudgeSection } from "./general/NudgeSection.js";
import { SoundSection } from "./general/SoundSection.js";

export function AlertsTab() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-on-surface">Alerts & Feedback</h2>
        <p className="mt-1 text-sm text-on-surface-muted">
          Notifications, sounds, and lightweight prompts that help you notice important work.
        </p>
      </div>

      <NotificationSection />
      <SoundSection />
      <NudgeSection />
    </div>
  );
}
