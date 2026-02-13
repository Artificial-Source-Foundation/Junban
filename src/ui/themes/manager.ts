import { BUILT_IN_THEMES, type Theme } from "../../config/themes.js";

const STORAGE_KEY = "docket-theme";

/** Theme manager — handles loading, switching, and custom theme support. */
export class ThemeManager {
  private currentTheme: string;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.currentTheme = stored ?? "light";
    this.applyTheme();
  }

  /** Get the currently active theme ID. */
  getCurrent(): string {
    return this.currentTheme;
  }

  /** Switch to a different theme by ID. */
  setTheme(themeId: string): void {
    const theme = BUILT_IN_THEMES.find((t) => t.id === themeId);
    if (!theme) {
      console.warn(`Unknown theme: ${themeId}`);
      return;
    }

    this.currentTheme = themeId;
    localStorage.setItem(STORAGE_KEY, themeId);
    this.applyTheme();
  }

  /** Toggle between light and dark themes. */
  toggle(): void {
    this.setTheme(this.currentTheme === "dark" ? "light" : "dark");
  }

  /** List all available themes (built-in + custom). */
  listThemes(): Theme[] {
    // TODO: Include custom CSS themes from plugins
    return [...BUILT_IN_THEMES];
  }

  private applyTheme(): void {
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
