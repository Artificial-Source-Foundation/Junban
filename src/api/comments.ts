import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";

export function commentRoutes(services: AppServices): Hono {
  const app = new Hono();

  // PATCH /comments/:id
  app.patch("/:id", async (c) => {
    const commentId = decodeURIComponent(c.req.param("id"));
    const body = await c.req.json();
    services.storage.updateTaskComment(commentId, {
      content: body.content as string,
      updatedAt: new Date().toISOString(),
    });
    return c.json({ ok: true });
  });

  // DELETE /comments/:id
  app.delete("/:id", async (c) => {
    const commentId = decodeURIComponent(c.req.param("id"));
    services.storage.deleteTaskComment(commentId);
    return c.body(null, 204);
  });

  return app;
}
