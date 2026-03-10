import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";

export function projectRoutes(services: AppServices): Hono {
  const app = new Hono();

  // GET /projects
  app.get("/", async (c) => {
    const projects = await services.projectService.list();
    return c.json(projects);
  });

  // POST /projects
  app.post("/", async (c) => {
    const body = await c.req.json();
    const name = body.name as string;
    if (!name) {
      return c.json({ error: "name is required" }, 400);
    }
    const project = await services.projectService.create(name, {
      color: body.color || undefined,
      parentId: body.parentId || null,
      isFavorite: body.isFavorite || false,
      viewStyle: body.viewStyle || "list",
    });
    if (body.icon) {
      const updated = await services.projectService.update(project.id, {
        icon: body.icon as string,
      });
      return c.json(updated ?? project, 201);
    }
    return c.json(project, 201);
  });

  // PATCH /projects/:id
  app.patch("/:id", async (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    const body = await c.req.json();
    const project = await services.projectService.update(id, body);
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }
    return c.json(project);
  });

  // DELETE /projects/:id
  app.delete("/:id", async (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    await services.projectService.delete(id);
    return c.body(null, 204);
  });

  return app;
}
