import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { serve, type HttpBindings } from "@hono/node-server";
import { createNodeBackendRuntime } from "./bootstrap.js";
import { loadEnv } from "./config/env.js";
import { NotFoundError, ValidationError } from "./core/errors.js";
import { createLogger, setDefaultLogLevel } from "./utils/logger.js";
import { taskRoutes } from "./api/tasks.js";
import { projectRoutes } from "./api/projects.js";
import { tagRoutes } from "./api/tags.js";
import { sectionRoutes } from "./api/sections.js";
import { commentRoutes } from "./api/comments.js";
import { templateRoutes } from "./api/templates.js";
import { settingsRoutes } from "./api/settings.js";
import { statsRoutes } from "./api/stats.js";
import { pluginRoutes } from "./api/plugins.js";
import { aiRoutes } from "./api/ai.js";
import { voiceRoutes } from "./api/voice.js";

const env = loadEnv();
setDefaultLogLevel(env.LOG_LEVEL);
const logger = createLogger("server");

const API_HOST = process.env.API_HOST?.trim() || "127.0.0.1";
const API_PORT = parseInt(process.env.API_PORT ?? "4822", 10);
const BODY_LIMIT_BYTES = 10 * 1024 * 1024;
const VOICE_BODY_LIMIT_BYTES = 25 * 1024 * 1024;
const TEST_RESET_TOKEN = process.env.JUNBAN_TEST_RESET_TOKEN?.trim();
const ALLOW_UNSAFE_API_HOST = process.env.JUNBAN_ALLOW_UNSAFE_API_HOST === "true";

function isLoopbackHost(host: string): boolean {
  const normalized = normalizeHost(host);
  if (normalized === "localhost" || normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    return isLoopbackHost(normalized.slice("::ffff:".length));
  }

  const octets = normalized.split(".");
  return (
    octets.length === 4 &&
    octets[0] === "127" &&
    octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)
  );
}

function normalizeHost(host: string): string {
  const trimmed = host.trim().toLowerCase();
  return trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed;
}

function bodyLimitForPath(pathname: string): number {
  return pathname === "/api/voice/transcribe" ? VOICE_BODY_LIMIT_BYTES : BODY_LIMIT_BYTES;
}

if (!isLoopbackHost(API_HOST) && !ALLOW_UNSAFE_API_HOST) {
  throw new Error(
    `Refusing to bind API server to non-loopback host "${API_HOST}". Set JUNBAN_ALLOW_UNSAFE_API_HOST=true only when the network exposure is intentional and protected.`,
  );
}

logger.info("Bootstrapping services...");
const runtime = createNodeBackendRuntime();
const { services } = runtime;
let runtimeReady = false;
let startupError: string | null = null;

try {
  await runtime.initialize();
  runtimeReady = true;
} catch (err) {
  startupError = err instanceof Error ? err.message : String(err);
  logger.error(`Plugin startup failed during server bootstrap: ${startupError}`);
}

async function ensurePluginsLoaded(): Promise<void> {
  try {
    await runtime.initialize();
    runtimeReady = true;
    startupError = null;
  } catch (err) {
    runtimeReady = false;
    startupError = err instanceof Error ? err.message : String(err);
    throw err;
  }
}

// Build Hono app
const app = new Hono<{ Bindings: HttpBindings }>();

// Security headers
app.use("*", secureHeaders());

// Global body-size limit. Voice upload routes need Groq's 25MB limit.
app.use("*", async (c, next) => {
  return bodyLimit({ maxSize: bodyLimitForPath(c.req.path) })(c, next);
});

// CORS middleware — restrict to localhost origins only
const ALLOWED_ORIGINS = [
  `http://localhost:${API_PORT}`,
  "http://localhost:5173", // Vite dev server
  "http://127.0.0.1:5173",
  "http://localhost:4173", // Vite preview
  "http://127.0.0.1:4173",
  "tauri://localhost", // Tauri webview
  "https://tauri.localhost", // Tauri webview (Windows)
];
app.use(
  "*",
  cors({
    origin: ALLOWED_ORIGINS,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "x-api-key", "Authorization", "x-junban-test-reset-token"],
  }),
);

// Global error handler
app.onError((err, c) => {
  const message = err instanceof Error ? err.message : "Internal server error";
  let status: 400 | 404 | 500 = 500;
  if (err instanceof NotFoundError) {
    status = 404;
  } else if (err instanceof ValidationError) {
    status = 400;
  } else if (message.includes("Invalid JSON") || message.includes("cycle")) {
    status = 400;
  }
  logger.error(`API error: ${message}`);
  // Only expose specific error messages for client errors; hide internal details for 500s
  const clientMessage = status === 500 ? "Internal server error" : message;
  return c.json({ error: clientMessage }, status);
});

// POST /api/test-reset — delete all data (for E2E tests only)
if (process.env.NODE_ENV === "test" || process.env.E2E_MODE === "true") {
  app.post("/api/test-reset", async (c) => {
    const requestHost = c.env?.incoming?.socket.remoteAddress ?? new URL(c.req.url).hostname;
    const token = c.req.header("x-junban-test-reset-token")?.trim();
    if (!isLoopbackHost(requestHost) && (!TEST_RESET_TOKEN || token !== TEST_RESET_TOKEN)) {
      return c.json(
        { error: "test reset is restricted to loopback or token-authenticated calls" },
        403,
      );
    }
    const tasks = await services.taskService.list();
    if (tasks.length > 0) {
      await services.taskService.deleteMany(tasks.map((t) => t.id));
    }
    const projects = await services.projectService.list();
    for (const p of projects) {
      await services.projectService.delete(p.id);
    }
    const tags = await services.tagService.list();
    for (const t of tags) {
      await services.tagService.delete(t.id);
    }
    return c.json({ ok: true });
  });
}

// Mount route modules
app.route("/api/tasks", taskRoutes(services));
app.route("/api/projects", projectRoutes(services));
app.route("/api/tags", tagRoutes(services));
app.route("/api/sections", sectionRoutes(services));
app.route("/api/comments", commentRoutes(services));
app.route("/api/templates", templateRoutes(services));
app.route("/api/settings", settingsRoutes(services));
app.route("/api/stats", statsRoutes(services));
app.route(
  "/api/plugins",
  pluginRoutes(services, {
    ensurePluginsLoaded,
  }),
);
app.route(
  "/api/ai",
  aiRoutes(services, {
    ensurePluginsLoaded,
  }),
);
app.route("/api/voice", voiceRoutes());

// Health check
app.get("/api/health", (c) =>
  c.json({
    ok: true,
    ready: runtimeReady,
    degraded: !runtimeReady,
    service: "junban-backend",
    runtime: "node",
    ...(startupError ? { degradedReason: "plugin_initialization_failed" } : {}),
  }),
);

// Start the server
const server = serve(
  {
    fetch: app.fetch,
    hostname: API_HOST,
    port: API_PORT,
  },
  (info) => {
    logger.info(`API server listening on ${API_HOST}:${info.port}`);
  },
);

// Graceful shutdown
let shuttingDown: Promise<void> | null = null;
let shutdownExitCode = 0;
async function shutdown(signal: string, requestedExitCode = 0) {
  shutdownExitCode = Math.max(shutdownExitCode, requestedExitCode);

  if (shuttingDown) {
    return shuttingDown;
  }

  shuttingDown = (async () => {
    logger.info(`${signal} received, shutting down...`);

    // Force exit after 5s if graceful shutdown stalls.
    const forceExitTimer = setTimeout(() => process.exit(1), 5000);
    forceExitTimer.unref();

    // Stop accepting new requests first to avoid teardown races.
    const serverClosed = new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        logger.info("Server closed");
        resolve();
      });
    });

    try {
      await serverClosed;
      await runtime.dispose();
      clearTimeout(forceExitTimer);
      process.exit(shutdownExitCode);
    } catch (err) {
      clearTimeout(forceExitTimer);
      logger.error(`Shutdown failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  })();

  return shuttingDown;
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  void shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  void shutdown("unhandledRejection", 1);
});

export { app, services };
