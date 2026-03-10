import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";

export function statsRoutes(services: AppServices): Hono {
  const app = new Hono();

  // GET /stats/daily?startDate=X&endDate=Y
  app.get("/daily", async (c) => {
    const startDate = c.req.query("startDate") ?? "";
    const endDate = c.req.query("endDate") ?? "";
    const stats = await services.statsService.getStats(startDate, endDate);
    return c.json(stats);
  });

  // GET /stats/today
  app.get("/today", async (c) => {
    const stat = await services.statsService.getToday();
    return c.json(stat);
  });

  return app;
}
