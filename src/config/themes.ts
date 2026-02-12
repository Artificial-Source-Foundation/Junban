/** Built-in theme definitions. */

export interface Theme {
  id: string;
  name: string;
  type: "light" | "dark";
  cssFile: string;
}

export const BUILT_IN_THEMES: Theme[] = [
  { id: "light", name: "Light", type: "light", cssFile: "light.css" },
  { id: "dark", name: "Dark", type: "dark", cssFile: "dark.css" },
];
