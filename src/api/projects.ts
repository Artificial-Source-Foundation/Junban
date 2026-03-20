import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";
import { CreateProjectInput, UpdateProjectInput } from "../core/types.js";

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
    const parsed = CreateProjectInput.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const { name, color, parentId, isFavorite, viewStyle, icon } = parsed.data;
    const project = await services.projectService.create(name, {
      color: color || undefined,
      parentId: parentId || null,
      isFavorite: isFavorite || false,
      viewStyle: viewStyle || "list",
    });
    if (icon) {
      const updated = await services.projectService.update(project.id, {
        icon,
      });
      return c.json(updated ?? project, 201);
    }
    return c.json(project, 201);
  });

  // PATCH /projects/:id
  app.patch("/:id", async (c) => {
    const id = decodeURIComponent(c.req.param("id"));
    const body = await c.req.json();
    const parsed = UpdateProjectInput.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    const project = await services.projectService.update(id, parsed.data);
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
