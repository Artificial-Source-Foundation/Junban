import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ViteDevServer } from "vite";
import type { IncomingMessage } from "node:http";

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk));
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
  });
}

function apiPlugin() {
  return {
    name: "docket-api",
    configureServer(server: ViteDevServer) {
      // Lazy-load bootstrap to avoid issues with Vite's module resolution
      let services: Awaited<
        ReturnType<typeof import("./src/bootstrap.js").bootstrap>
      > | null = null;

      async function getServices() {
        if (!services) {
          const { bootstrap } = await import("./src/bootstrap.js");
          services = bootstrap();
        }
        return services;
      }

      // POST /api/tasks — create task
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/tasks") return next();

        const svc = await getServices();

        if (req.method === "GET") {
          const tasks = await svc.taskService.list();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(tasks));
          return;
        }

        if (req.method === "POST") {
          const body = await parseBody(req);
          const task = await svc.taskService.create(body as any);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 201;
          res.end(JSON.stringify(task));
          return;
        }

        next();
      });

      // /api/tasks/:id/complete and /api/tasks/:id
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/tasks\/([^/]+)\/complete$/);
        if (match && req.method === "POST") {
          const svc = await getServices();
          try {
            const task = await svc.taskService.complete(match[1]);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(task));
          } catch (err: any) {
            res.statusCode = err.name === "NotFoundError" ? 404 : 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        const taskMatch = req.url?.match(/^\/api\/tasks\/([^/]+)$/);
        if (!taskMatch) return next();

        const id = taskMatch[1];
        const svc = await getServices();

        if (req.method === "PATCH") {
          try {
            const body = await parseBody(req);
            const task = await svc.taskService.update(id, body as any);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(task));
          } catch (err: any) {
            res.statusCode = err.name === "NotFoundError" ? 404 : 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === "DELETE") {
          await svc.taskService.delete(id);
          res.statusCode = 204;
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
