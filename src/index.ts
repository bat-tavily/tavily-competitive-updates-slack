import { loadConfig } from "./config";
import { logger } from "./logger";
import { startScheduler } from "./scheduler";
import { CompetitorTracker } from "./competitors/tracker";

async function main(): Promise<void> {
  const config = loadConfig();
  logger.setLevel(config.logLevel);

  logger.info("Tavily Competitive Updates starting up");
  logger.info(`Monitoring ${config.competitors.length} competitor(s): ${config.competitors.join(", ")}`);
  logger.info(`Schedule: ${config.searchIntervalCron}`);

  // Run an immediate update on startup
  const tracker = new CompetitorTracker(config);
  try {
    await tracker.runUpdate();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Initial update failed: ${message}`);
  }

  // Start the cron scheduler
  const task = startScheduler(config);

  // Graceful shutdown
  const shutdown = (): void => {
    logger.info("Shutting down...");
    task.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  logger.info("Scheduler running. Press Ctrl+C to stop.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
