export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let defaultLevel: LogLevel = "info";

/** Set the global default log level. Call once at startup. */
export function setDefaultLogLevel(level: LogLevel): void {
  defaultLevel = level;
}

/** Simple structured logger with module scope. */
export function createLogger(module: string, level?: LogLevel) {
  const threshold = LOG_LEVELS[level ?? defaultLevel];

  function log(logLevel: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LOG_LEVELS[logLevel] < threshold) return;

    const entry = {
      level: logLevel,
      time: new Date().toISOString(),
      module,
      msg: message,
      ...data,
    };

    if (logLevel === "error") {
      console.error(JSON.stringify(entry));
    } else if (logLevel === "warn") {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  return {
    debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
  };
}

export type Logger = ReturnType<typeof createLogger>;
