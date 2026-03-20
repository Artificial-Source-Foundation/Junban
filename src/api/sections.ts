import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";
import {
  CreateSectionInput,
  UpdateSectionInput,
  ReorderInput,
} from "../core/types.js";

export function sectionRoutes(services: AppServices): Hono {
  const app = new Hono();

  // POST /sections/reorder
  app.post("/reorder", async (c) => {
    const body = await c.req.json();
    const parsed = ReorderInput.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        400,
      );
    }
    await services.sectionService.reorder(parsed.data.orderedIds);
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
    const parsed = CreateSectionInput.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        400,
      );
    }
    const section = await services.sectionService.create(parsed.data);
    return c.json(section, 201);
  });

  // PATCH /sections/:id
  app.patch("/:id", async (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    const body = await c.req.json();
    const parsed = UpdateSectionInput.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        400,
      );
    }
    const section = await services.sectionService.update(id, parsed.data);
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
