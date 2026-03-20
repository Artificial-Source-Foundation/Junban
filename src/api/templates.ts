import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  InstantiateTemplateInput,
} from "../core/types.js";

export function templateRoutes(services: AppServices): Hono {
  const app = new Hono();

  // GET /templates
  app.get("/", async (c) => {
    const templates = await services.templateService.list();
    return c.json(templates);
  });

  // POST /templates
  app.post("/", async (c) => {
    const body = await c.req.json();
    const parsed = CreateTemplateInput.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const template = await services.templateService.create(parsed.data);
    return c.json(template, 201);
  });

  // POST /templates/:id/instantiate
  app.post("/:id/instantiate", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = InstantiateTemplateInput.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const task = await services.templateService.instantiate(id, parsed.data.variables);
    return c.json(task, 201);
  });

  // PATCH /templates/:id
  app.patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = UpdateTemplateInput.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const template = await services.templateService.update(id, parsed.data);
    return c.json(template);
  });

  // DELETE /templates/:id
  app.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await services.templateService.delete(id);
    return c.body(null, 204);
  });

  return app;
}
