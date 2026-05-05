import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

const ENV_KEYS = [
  "API_HOST",
  "JUNBAN_ALLOW_UNSAFE_API_HOST",
  "JUNBAN_TEST_RESET_TOKEN",
  "NODE_ENV",
  "E2E_MODE",
] as const;

function createServices() {
  return {
    taskService: {
      list: vi.fn().mockResolvedValue([{ id: "task-1" }]),
      deleteMany: vi.fn().mockResolvedValue(undefined),
    },
    projectService: {
      list: vi.fn().mockResolvedValue([{ id: "project-1" }]),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    tagService: {
      list: vi.fn().mockResolvedValue([{ id: "tag-1" }]),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function mockServerDependencies(
  options: {
    services?: ReturnType<typeof createServices>;
    initialize?: () => Promise<void>;
  } = {},
) {
  const services = options.services ?? createServices();
  const initialize = vi.fn(options.initialize ?? (() => Promise.resolve()));
  const dispose = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const serve = vi.fn(() => ({ close: vi.fn() }));
  const bodyLimitCalls: Array<{ path: string; maxSize: number }> = [];
  const bodyLimit = vi.fn(
    (config: { maxSize: number }) => async (c: any, next: () => Promise<void>) => {
      bodyLimitCalls.push({ path: c.req.path, maxSize: config.maxSize });
      return next();
    },
  );

  vi.spyOn(process, "on").mockImplementation(
    ((..._args: unknown[]) => process) as unknown as typeof process.on,
  );

  vi.doMock("../../src/bootstrap.js", () => ({
    createNodeBackendRuntime: vi.fn(() => ({ services, initialize, dispose })),
  }));
  vi.doMock("../../src/config/env.js", () => ({
    loadEnv: vi.fn(() => ({ LOG_LEVEL: "info" })),
  }));
  vi.doMock("../../src/utils/logger.js", () => ({
    setDefaultLogLevel: vi.fn(),
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    })),
  }));
  vi.doMock("../../src/core/errors.js", () => ({
    NotFoundError: class NotFoundError extends Error {},
    ValidationError: class ValidationError extends Error {},
  }));
  vi.doMock("@hono/node-server", () => ({ serve }));
  vi.doMock("hono/cors", () => ({
    cors: vi.fn(() => async (_c: unknown, next: () => Promise<void>) => next()),
  }));
  vi.doMock("hono/secure-headers", () => ({
    secureHeaders: vi.fn(() => async (_c: unknown, next: () => Promise<void>) => next()),
  }));
  vi.doMock("hono/body-limit", () => ({ bodyLimit }));

  vi.doMock("../../src/api/tasks.js", () => ({ taskRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/projects.js", () => ({ projectRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/tags.js", () => ({ tagRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/sections.js", () => ({ sectionRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/comments.js", () => ({ commentRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/templates.js", () => ({ templateRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/settings.js", () => ({ settingsRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/stats.js", () => ({ statsRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/plugins.js", () => ({ pluginRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/ai.js", () => ({ aiRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/voice.js", () => ({ voiceRoutes: vi.fn(() => new Hono()) }));

  return { services, initialize, serve, bodyLimitCalls };
}

describe("server security contract", () => {
  const previousEnv = new Map<string, string | undefined>();

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    previousEnv.clear();
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = previousEnv.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("binds the standalone API to loopback by default", async () => {
    const { serve } = mockServerDependencies();

    await import("../../src/server.js");

    expect(serve).toHaveBeenCalledWith(
      expect.objectContaining({ hostname: "127.0.0.1", port: 4822 }),
      expect.any(Function),
    );
  });

  it("refuses non-loopback API binds without explicit unsafe opt-in", async () => {
    process.env.API_HOST = "0.0.0.0";
    const { serve } = mockServerDependencies();

    await expect(import("../../src/server.js")).rejects.toThrow(/Refusing to bind API server/);
    expect(serve).not.toHaveBeenCalled();
  });

  it("allows non-loopback API binds with explicit unsafe opt-in", async () => {
    process.env.API_HOST = "0.0.0.0";
    process.env.JUNBAN_ALLOW_UNSAFE_API_HOST = "true";
    const { serve } = mockServerDependencies();

    await import("../../src/server.js");

    expect(serve).toHaveBeenCalledWith(
      expect.objectContaining({ hostname: "0.0.0.0" }),
      expect.any(Function),
    );
  });

  it("uses a 25MB Hono body limit for voice transcribe and 10MB elsewhere", async () => {
    const { bodyLimitCalls } = mockServerDependencies();
    const { app } = await import("../../src/server.js");

    await app.request("http://127.0.0.1/api/voice/transcribe", { method: "POST" });
    await app.request("http://127.0.0.1/api/tasks", { method: "POST" });

    expect(bodyLimitCalls).toContainEqual({
      path: "/api/voice/transcribe",
      maxSize: 25 * 1024 * 1024,
    });
    expect(bodyLimitCalls).toContainEqual({
      path: "/api/tasks",
      maxSize: 10 * 1024 * 1024,
    });
  });

  it("reports ready health when runtime initialization succeeds", async () => {
    mockServerDependencies();
    const { app } = await import("../../src/server.js");

    const res = await app.request("http://127.0.0.1/api/health");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      ready: true,
      degraded: false,
      service: "junban-backend",
      runtime: "node",
    });
  });

  it("reports degraded health without changing backend identity", async () => {
    mockServerDependencies({
      initialize: () => Promise.reject(new Error("plugin startup failed")),
    });
    const { app } = await import("../../src/server.js");

    const res = await app.request("http://127.0.0.1/api/health");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      ready: false,
      degraded: true,
      service: "junban-backend",
      runtime: "node",
      degradedReason: "plugin_initialization_failed",
    });
  });

  it("allows test reset from loopback without a token", async () => {
    process.env.NODE_ENV = "test";
    const { services } = mockServerDependencies();
    const { app } = await import("../../src/server.js");

    const res = await app.request("http://127.0.0.1/api/test-reset", { method: "POST" });

    expect(res.status).toBe(200);
    expect(services.taskService.deleteMany).toHaveBeenCalledWith(["task-1"]);
    expect(services.projectService.delete).toHaveBeenCalledWith("project-1");
    expect(services.tagService.delete).toHaveBeenCalledWith("tag-1");
  });

  it("requires a token for non-loopback test reset calls", async () => {
    process.env.NODE_ENV = "test";
    process.env.JUNBAN_TEST_RESET_TOKEN = "reset-token";
    const { services } = mockServerDependencies();
    const { app } = await import("../../src/server.js");

    const denied = await app.request("http://203.0.113.10/api/test-reset", { method: "POST" });
    expect(denied.status).toBe(403);
    expect(services.taskService.deleteMany).not.toHaveBeenCalled();

    const allowed = await app.request("http://203.0.113.10/api/test-reset", {
      method: "POST",
      headers: { "x-junban-test-reset-token": "reset-token" },
    });
    expect(allowed.status).toBe(200);
    expect(services.taskService.deleteMany).toHaveBeenCalledWith(["task-1"]);
  });
});
