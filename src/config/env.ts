import { z } from "zod";

const envSchema = z.object({
  DB_PATH: z.string().default("./data/docket.db"),
  STORAGE_MODE: z.enum(["sqlite", "markdown"]).default("sqlite"),
  MARKDOWN_PATH: z.string().default("./tasks/"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  PORT: z.coerce.number().default(5173),
  DEFAULT_THEME: z.enum(["light", "dark"]).default("light"),
  NLP_LOCALE: z.string().default("en"),
  PLUGIN_DIR: z.string().default("./plugins/"),
  PLUGIN_SANDBOX: z.coerce.boolean().default(true),
  PLUGIN_REGISTRY_URL: z.string().optional(),
  PLUGIN_MAX_SIZE_MB: z.coerce.number().default(10),
  CLI_OUTPUT_FORMAT: z.enum(["text", "json"]).default("text"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}
