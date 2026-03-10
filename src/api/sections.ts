import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";

export function sectionRoutes(services: AppServices): Hono {
  const app = new Hono();

  // POST /sections/reorder
  app.post("/reorder", async (c) => {
    const { orderedIds } = await c.req.json();
    await services.sectionService.reorder(orderedIds);
    return c.json({ ok: true });
  });

  // GET /sections?projectId=X
  app.get("/", async (c) => {
    const projectId = c.req.query("projectId");
    if (!projectId) {
      return c.json({ error: "projectId is required" }, 400);
    }
    const sections = await services.sectionService.list(projectId);
    return c.json(sections);
  });

  // POST /sections
  app.post("/", async (c) => {
    const body = await c.req.json();
    const section = await services.sectionService.create(body);
    return c.json(section, 201);
  });

  // PATCH /sections/:id
  app.patch("/:id", async (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    const body = await c.req.json();
    const section = await services.sectionService.update(id, body);
    return c.json(section);
  });

  // DELETE /sections/:id
  app.delete("/:id", async (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    await services.sectionService.delete(id);
    return c.body(null, 204);
  });

  return app;
}
