import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";

export function tagRoutes(services: AppServices): Hono {
  const app = new Hono();

  // GET /tags
  app.get("/", async (c) => {
    const tags = await services.tagService.list();
    return c.json(tags);
  });

  return app;
}
