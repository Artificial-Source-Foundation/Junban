import { Readable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { registerAIRoutes } from "../../vite-api-routes/ai.js";

function createServices() {
  return {
    storage: {
      getAppSetting: vi.fn(),
      setAppSetting: vi.fn(),
      deleteAppSetting: vi.fn(),
    },
    chatManager: {
      clearSession: vi.fn(),
    },
    aiProviderRegistry: {
      getAll: vi.fn().mockReturnValue([]),
    },
  };
}

function createServer() {
  const middlewares: Array<(req: any, res: any, next: () => void) => unknown> = [];
  const server = {
    middlewares: {
      use(fn: (req: any, res: any, next: () => void) => unknown) {
        middlewares.push(fn);
      },
    },
  };
  return { server, middlewares };
}

async function dispatch(
  middlewares: Array<(req: any, res: any, next: () => void) => unknown>,
  body: Record<string, unknown>,
) {
  const req = Object.assign(Readable.from([JSON.stringify(body)]), {
    url: "/api/ai/config",
    method: "PUT",
    headers: {},
  });
  const headers = new Map<string, string>();
  let responseBody = "";
  let ended = false;
  const res = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
    end(chunk?: string | Buffer) {
      responseBody = chunk?.toString() ?? "";
      ended = true;
    },
  };

  for (const fn of middlewares) {
    let shouldContinue = false;
    await fn(req, res, () => {
      shouldContinue = true;
    });
    if (ended || !shouldContinue) {
      break;
    }
  }

  return { statusCode: res.statusCode, body: responseBody, headers, ended };
}

describe("vite AI config route security guardrails", () => {
  it("rejects unsafe AI base URLs on config writes", async () => {
    const services = createServices();
    const getServices = vi.fn().mockResolvedValue(services);
    const { server, middlewares } = createServer();
    registerAIRoutes(server as never, getServices);

    const res = await dispatch(middlewares, { baseUrl: "http://192.168.1.20:11434" });

    expect(res.ended).toBe(true);
    expect(res.statusCode).toBe(400);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(res.body)).toEqual({ error: "Invalid baseUrl" });
    expect(services.storage.setAppSetting).not.toHaveBeenCalledWith(
      "ai_base_url",
      expect.any(String),
    );
    expect(services.chatManager.clearSession).not.toHaveBeenCalled();
  });
});
