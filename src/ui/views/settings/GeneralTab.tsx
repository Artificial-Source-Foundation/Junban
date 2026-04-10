import { useGeneralSettings } from "../../context/SettingsContext.js";
import { DateTimeSection } from "./general/DateTimeSection.js";
import { TaskDefaultsSection } from "./general/TaskDefaultsSection.js";

export function GeneralTab() {
  const { loaded } = useGeneralSettings();

  if (!loaded) return null;

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-on-surface">Essentials</h2>
        <p className="mt-1 text-sm text-on-surface-muted">
          Core preferences for how Junban looks and behaves day to day.
        </p>
      </div>

      <DateTimeSection />
      <TaskDefaultsSection />
    </div>
  );
}
