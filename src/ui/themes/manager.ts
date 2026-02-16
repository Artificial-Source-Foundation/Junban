import { BUILT_IN_THEMES, type Theme } from "../../config/themes.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("theme");

const STORAGE_KEY = "saydo-theme";

/** Theme manager — handles loading and switching between built-in Light/Dark themes. */
export class ThemeManager {
  private currentTheme: string;
  private systemThemeQuery: MediaQueryList;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.currentTheme = stored ?? "system";
    this.systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemThemeQuery.addEventListener("change", () => {
      if (this.currentTheme === "system") {
        this.applyTheme();
      }
    });
    this.applyTheme();
  }

  /** Get the currently active theme ID. */
  getCurrent(): string {
    return this.currentTheme;
  }

  /** Switch to a different theme by ID. */
  setTheme(themeId: string): void {
    if (themeId === "system") {
      this.currentTheme = "system";
      localStorage.removeItem(STORAGE_KEY);
      this.applyTheme();
      return;
    }

    const builtIn = BUILT_IN_THEMES.find((t) => t.id === themeId);
    if (builtIn) {
      this.currentTheme = themeId;
      localStorage.setItem(STORAGE_KEY, themeId);
      this.applyTheme();
      return;
    }

    logger.warn("Unknown theme requested", { themeId });
  }

  /** Toggle between light and dark themes. */
  toggle(): void {
    const isDark = document.documentElement.classList.contains("dark");
    this.setTheme(isDark ? "light" : "dark");
  }

  /** List all available themes. */
  listThemes(): Theme[] {
    return [...BUILT_IN_THEMES];
  }

  private applyTheme(): void {
    if (this.currentTheme === "system") {
      if (this.systemThemeQuery.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return;
    }

    const theme = BUILT_IN_THEMES.find((t) => t.id === this.currentTheme);
    if (!theme) return;

    if (theme.type === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export const themeManager = new ThemeManager();
