import { z } from "zod";
import os from "node:os";
import path from "node:path";

const PROFILE_DEFAULTS = {
  daily: {
    DB_PATH: "./data/junban.db",
    MARKDOWN_PATH: "./tasks/",
  },
  dev: {
    DB_PATH: "./data/dev/junban.db",
    MARKDOWN_PATH: "./tasks/dev/",
  },
} as const;

const profileSchema = z.enum(["daily", "dev"]);

function getLinuxDataHome(): string | null {
  const xdgDataHome = process.env.XDG_DATA_HOME?.trim();
  if (xdgDataHome && path.isAbsolute(xdgDataHome) && !xdgDataHome.includes("\0")) {
    return xdgDataHome;
  }

  let home: string;
  try {
    home = process.env.HOME?.trim() || os.homedir();
  } catch {
    return null;
  }
  home = home.trim();
  if (!home || home.includes("\0") || !path.isAbsolute(home)) return null;
  return path.join(home, ".local", "share");
}

function getProfileDefaults(profile: z.infer<typeof profileSchema>) {
  if (profile === "daily" && process.platform === "linux") {
    const dataHome = getLinuxDataHome();
    if (dataHome) {
      const root = path.join(dataHome, "junban");
      return {
        DB_PATH: path.join(root, "junban.db"),
        MARKDOWN_PATH: path.join(root, "tasks"),
      };
    }
  }

  return PROFILE_DEFAULTS[profile];
}

const pathSchema = z
  .string()
  .trim()
  .min(1, "Path must not be empty")
  .refine((value) => !value.includes("\0"), "Path must not contain null bytes");

const envSchema = z.object({
  JUNBAN_PROFILE: profileSchema.default("daily"),
  DB_PATH: pathSchema,
  STORAGE_MODE: z.enum(["sqlite", "markdown"]).default("sqlite"),
  MARKDOWN_PATH: pathSchema,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  PORT: z.coerce.number().default(5173),
  DEFAULT_THEME: z.enum(["light", "dark"]).default("light"),
  NLP_LOCALE: z.string().default("en"),
  PLUGIN_DIR: pathSchema.default("./plugins/"),
  PLUGIN_SANDBOX: z
    .string()
    .default("true")
    .transform((v) => v !== "false" && v !== "0"),
  PLUGIN_REGISTRY_URL: z.string().optional(),
  PLUGIN_MAX_SIZE_MB: z.coerce.number().default(10),
  CLI_OUTPUT_FORMAT: z.enum(["text", "json"]).default("text"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const profile = profileSchema.parse(process.env.JUNBAN_PROFILE ?? "daily");
  const defaults = getProfileDefaults(profile);

  return envSchema.parse({
    ...process.env,
    JUNBAN_PROFILE: profile,
    DB_PATH: process.env.DB_PATH ?? defaults.DB_PATH,
    MARKDOWN_PATH: process.env.MARKDOWN_PATH ?? defaults.MARKDOWN_PATH,
  });
}
