import { TavilyClient } from "../tavily/client";
import { SlackClient } from "../slack/client";
import { formatSummaryMessage, type CompetitorUpdate } from "../slack/formatter";
import type { Config } from "../config";
import { logger } from "../logger";

export class CompetitorTracker {
  private readonly tavily: TavilyClient;
  private readonly slack: SlackClient;
  private readonly config: Config;

  constructor(config: Config) {
    this.tavily = new TavilyClient(config.tavily.apiKey);
    this.slack = new SlackClient(config.slack.botToken, config.slack.channelId);
    this.config = config;
  }

  async runUpdate(): Promise<void> {
    logger.info(`Starting competitive update for ${this.config.competitors.length} competitor(s)`);
    const updates: CompetitorUpdate[] = [];

    for (const competitor of this.config.competitors) {
      try {
        const update = await this.searchCompetitor(competitor);
        updates.push(update);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to search competitor: ${competitor}`, { competitor, error: message });
      }
    }

    if (updates.length === 0) {
      logger.warn("No competitor updates were retrieved. Skipping Slack notification.");
      return;
    }

    try {
      const { blocks, text } = formatSummaryMessage(updates);
      await this.slack.postMessage(blocks, text);
      logger.info("Competitive update posted to Slack");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to post competitive update to Slack: ${message}`);
    }
  }

  private async searchCompetitor(competitor: string): Promise<CompetitorUpdate> {
    logger.info(`Searching for updates on: ${competitor}`);

    const response = await this.tavily.search({
      query: `${competitor} latest news announcements updates`,
      search_depth: this.config.tavily.searchDepth,
      topic: "news",
      time_range: "week",
      max_results: 5,
    });

    logger.info(`Found ${response.results.length} result(s) for ${competitor}`);

    return {
      competitor,
      results: response.results,
      searchedAt: new Date(),
    };
  }
}
