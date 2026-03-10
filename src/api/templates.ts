import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";

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
    const template = await services.templateService.create(body);
    return c.json(template, 201);
  });

  // POST /templates/:id/instantiate
  app.post("/:id/instantiate", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const task = await services.templateService.instantiate(id, body.variables);
    return c.json(task, 201);
  });

  // PATCH /templates/:id
  app.patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const template = await services.templateService.update(id, body);
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
