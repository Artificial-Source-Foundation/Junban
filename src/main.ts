import { loadEnv } from "./config/env.js";
import { createLogger } from "./utils/logger.js";
import { bootstrap } from "./bootstrap.js";

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL);

logger.info("ASF Docket starting...");

const services = bootstrap();

logger.info("Database initialized, services ready.");

// TODO: Initialize plugin loader (Sprint 3)
// TODO: Start UI or CLI based on context

export { env, logger, services };
