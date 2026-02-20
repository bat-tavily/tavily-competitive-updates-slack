import { WebClient } from "@slack/web-api";
import type { KnownBlock } from "@slack/web-api";
import { logger } from "../logger";

export class SlackClient {
  private readonly client: WebClient;
  private readonly defaultChannelId: string;

  constructor(botToken: string, defaultChannelId: string) {
    this.client = new WebClient(botToken);
    this.defaultChannelId = defaultChannelId;
  }

  async postMessage(blocks: KnownBlock[], text: string, channelId?: string): Promise<void> {
    const channel = channelId || this.defaultChannelId;
    logger.debug(`Posting message to Slack channel ${channel}`);

    try {
      await this.client.chat.postMessage({
        channel,
        blocks,
        text, // fallback for notifications
      });
      logger.info(`Message posted to Slack channel ${channel}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to post Slack message: ${message}`, { channel });
      throw error;
    }
  }
}
