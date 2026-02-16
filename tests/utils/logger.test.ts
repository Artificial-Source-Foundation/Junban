import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger, setDefaultLogLevel } from "../../src/utils/logger.js";

describe("createLogger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // Reset default level
    setDefaultLogLevel("info");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("includes module field in JSON output", () => {
    const logger = createLogger("test-module");
    logger.info("hello");

    expect(logSpy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.module).toBe("test-module");
    expect(parsed.level).toBe("info");
    expect(parsed.msg).toBe("hello");
    expect(parsed.time).toBeDefined();
  });

  it("passes data fields through to JSON output", () => {
    const logger = createLogger("data-test", "debug");
    logger.info("with data", { count: 5, name: "foo" });

    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.count).toBe(5);
    expect(parsed.name).toBe("foo");
  });

  it("routes debug and info to console.log", () => {
    const logger = createLogger("routing", "debug");
    logger.debug("d");
    logger.info("i");

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("routes warn to console.warn", () => {
    const logger = createLogger("routing");
    logger.warn("w");

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("routes error to console.error", () => {
    const logger = createLogger("routing");
    logger.error("e");

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("filters messages below the threshold", () => {
    const logger = createLogger("filter", "warn");
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("uses default level when no explicit level given", () => {
    setDefaultLogLevel("error");
    const logger = createLogger("default-test");

    logger.info("should not appear");
    logger.warn("should not appear");
    logger.error("should appear");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("explicit level overrides the default", () => {
    setDefaultLogLevel("error");
    const logger = createLogger("override-test", "debug");

    logger.debug("should appear");
    expect(logSpy).toHaveBeenCalledOnce();
  });
});
