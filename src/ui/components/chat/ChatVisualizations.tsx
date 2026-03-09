import { Zap, Brain } from "lucide-react";

export function WorkloadChart({ data }: { data: Record<string, unknown> }) {
  const days = (data.days ?? data.workload ?? []) as {
    date?: string;
    day?: string;
    count?: number;
    tasks?: number;
    overloaded?: boolean;
  }[];
  if (!Array.isArray(days) || days.length === 0) return null;

  const maxCount = Math.max(...days.map((d) => d.count ?? d.tasks ?? 0), 1);

  return (
    <div className="space-y-1.5">
      {days.map((day, i) => {
        const count = day.count ?? day.tasks ?? 0;
        const label = day.date ?? day.day ?? `Day ${i + 1}`;
        const pct = Math.round((count / maxCount) * 100);
        const isOverloaded = day.overloaded;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 text-on-surface-muted truncate">{label}</span>
            <div className="flex-1 h-2.5 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverloaded ? "bg-error/70" : "bg-accent/60"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={`w-6 text-right tabular-nums ${isOverloaded ? "text-error font-medium" : "text-on-surface-muted"}`}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CompletionPatterns({ data }: { data: Record<string, unknown> }) {
  const weekdays = (data.weekdays ?? data.byDay ?? []) as {
    day?: string;
    name?: string;
    count?: number;
    completed?: number;
  }[];
  const topTags = (data.topTags ?? data.tags ?? []) as {
    tag?: string;
    name?: string;
    count?: number;
  }[];

  if (weekdays.length === 0 && topTags.length === 0) return null;

  const maxDay = Math.max(...weekdays.map((w) => w.count ?? w.completed ?? 0), 1);
  const maxTag = Math.max(...topTags.map((t) => t.count ?? 0), 1);

  return (
    <div className="space-y-3">
      {weekdays.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-on-surface-muted uppercase tracking-wider mb-2">
            Activity by Day
          </p>
          <div className="flex items-end gap-1.5 h-14">
            {weekdays.map((w, i) => {
              const count = w.count ?? w.completed ?? 0;
              const pct = Math.round((count / maxDay) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent/40 rounded-sm transition-all duration-500"
                    style={{ height: `${Math.max(pct, 6)}%` }}
                    title={`${w.day ?? w.name}: ${count}`}
                  />
                  <span className="text-[9px] text-on-surface-muted font-medium">
                    {(w.day ?? w.name ?? "").slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {topTags.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-on-surface-muted uppercase tracking-wider mb-1.5">
            Top Tags
          </p>
          {topTags.slice(0, 5).map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs mb-1">
              <span className="w-20 shrink-0 text-on-surface-muted truncate">
                #{t.tag ?? t.name}
              </span>
              <div className="flex-1 h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent/50 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((t.count ?? 0) / maxTag) * 100)}%` }}
                />
              </div>
              <span className="w-4 text-right text-on-surface-muted tabular-nums">{t.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EnergyRecommendations({ data }: { data: Record<string, unknown> }) {
  const quickWins = (data.quickWins ?? data.quick ?? []) as { title?: string; id?: string }[];
  const deepWork = (data.deepWork ?? data.deep ?? []) as { title?: string; id?: string }[];

  if (quickWins.length === 0 && deepWork.length === 0) return null;

  return (
    <div className="space-y-3">
      {quickWins.length > 0 && (
        <div>
          <p className="text-xs font-medium text-on-surface-secondary flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-warning" />
            Quick Wins
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickWins.map((t, i) => (
              <span
                key={i}
                className="inline-flex px-2.5 py-1 text-xs bg-warning/10 text-warning rounded-lg font-medium"
              >
                {t.title ?? `Task ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}
      {deepWork.length > 0 && (
        <div>
          <p className="text-xs font-medium text-on-surface-secondary flex items-center gap-1.5 mb-2">
            <Brain size={12} className="text-info" />
            Deep Work
          </p>
          <div className="flex flex-wrap gap-1.5">
            {deepWork.map((t, i) => (
              <span
                key={i}
                className="inline-flex px-2.5 py-1 text-xs bg-info/10 text-info rounded-lg font-medium"
              >
                {t.title ?? `Task ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
