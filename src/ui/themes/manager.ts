import { BUILT_IN_THEMES, type Theme } from "../../config/themes.js";

/** Theme manager — handles loading, switching, and custom theme support. */
export class ThemeManager {
  private currentTheme: string;

  constructor(defaultTheme: string = "light") {
    this.currentTheme = defaultTheme;
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

    // Toggle dark mode class on document
    if (theme.type === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  /** List all available themes (built-in + custom). */
  listThemes(): Theme[] {
    // TODO: Include custom CSS themes from plugins
    return [...BUILT_IN_THEMES];
  }
}
