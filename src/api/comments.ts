import { Hono } from "hono";
import type { AppServices } from "../bootstrap.js";
import { CommentContentInput } from "../core/types.js";

export function commentRoutes(services: AppServices): Hono {
  const app = new Hono();

  // PATCH /comments/:id
  app.patch("/:id", async (c) => {
    const commentId = decodeURIComponent(c.req.param("id"));
    const body = await c.req.json();
    const parsed = CommentContentInput.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }
    services.storage.updateTaskComment(commentId, {
      content: parsed.data.content,
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
