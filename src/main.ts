import { loadEnv } from "./config/env.js";
import { createLogger } from "./utils/logger.js";

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL);

logger.info("ASF Docket starting...");

// TODO: Initialize database
// TODO: Initialize plugin loader
// TODO: Start UI or CLI based on context

export { env, logger };
