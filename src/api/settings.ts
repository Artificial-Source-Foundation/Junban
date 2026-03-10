import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";
import { loadEnv } from "../config/env.js";

export function settingsRoutes(services: AppServices): Hono {
  const app = new Hono();

  // GET /settings/storage — storage mode info
  app.get("/storage", async (c) => {
    const env = loadEnv();
    return c.json({
      mode: env.STORAGE_MODE,
      path: env.STORAGE_MODE === "markdown" ? env.MARKDOWN_PATH : env.DB_PATH,
    });
  });

  // GET /settings/:key
  app.get("/:key", async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const row = services.storage.getAppSetting(key);
    return c.json({ value: row?.value ?? null });
  });

  // PUT /settings/:key
  app.put("/:key", async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    const body = await c.req.json();
    services.storage.setAppSetting(key, body.value as string);
    return c.json({ ok: true });
  });

  return app;
}
