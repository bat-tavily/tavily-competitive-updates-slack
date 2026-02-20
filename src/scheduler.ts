import cron from "node-cron";
import { CompetitorTracker } from "./competitors/tracker";
import type { Config } from "./config";
import { logger } from "./logger";

export function startScheduler(config: Config): cron.ScheduledTask {
  const tracker = new CompetitorTracker(config);

  logger.info(`Scheduling competitive updates with cron: ${config.searchIntervalCron}`);

  if (!cron.validate(config.searchIntervalCron)) {
    throw new Error(`Invalid cron expression: ${config.searchIntervalCron}`);
  }

  const task = cron.schedule(config.searchIntervalCron, async () => {
    logger.info("Scheduled competitive update triggered");
    try {
      await tracker.runUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Scheduled update failed: ${message}`);
    }
  });

  return task;
}
