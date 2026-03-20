import { useState, useEffect, useMemo } from "react";
import { toDateKey } from "../../utils/format-date.js";

/**
 * Returns a memoized `{ today, todayDate }` that refreshes at midnight.
 *
 * - `today` — ISO date key string (e.g. "2026-03-20")
 * - `todayDate` — Date object set to midnight local time for the current day
 *
 * Avoids repeated `new Date()` / `toDateKey()` allocations in the render path.
 */
export function useToday() {
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    // Calculate ms until next midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setTodayKey(toDateKey(new Date()));
    }, msUntilMidnight + 50); // small buffer past midnight

    return () => clearTimeout(timeout);
  }, [todayKey]); // re-arm after each rollover

  const todayDate = useMemo(() => new Date(todayKey + "T00:00:00"), [todayKey]);

  return { today: todayKey, todayDate };
}
