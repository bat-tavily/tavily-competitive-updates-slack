import type { KnownBlock } from "@slack/web-api";
import type { TavilySearchResult } from "../tavily/types";

export interface CompetitorUpdate {
  competitor: string;
  results: TavilySearchResult[];
  searchedAt: Date;
}

export function formatCompetitorUpdate(update: CompetitorUpdate): KnownBlock[] {
  const blocks: KnownBlock[] = [];
  const timestamp = update.searchedAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${update.competitor} — Competitive Update`,
    },
  });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `${timestamp} · ${update.results.length} result(s) found`,
      },
    ],
  });

  blocks.push({ type: "divider" });

  if (update.results.length === 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_No new updates found for this competitor._",
      },
    });
    return blocks;
  }

  for (const result of update.results) {
    const snippet =
      result.content.length > 300
        ? result.content.slice(0, 297) + "..."
        : result.content;

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${result.url}|${escapeSlackText(result.title)}>*\n${escapeSlackText(snippet)}`,
      },
    });
  }

  return blocks;
}

export function formatSummaryMessage(updates: CompetitorUpdate[]): { blocks: KnownBlock[]; text: string } {
  const blocks: KnownBlock[] = [];

  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: "Competitive Intelligence Report",
    },
  });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Monitoring ${updates.length} competitor(s)`,
      },
    ],
  });

  blocks.push({ type: "divider" });

  for (const update of updates) {
    const resultBlocks = formatCompetitorUpdate(update);
    blocks.push(...resultBlocks);
    blocks.push({ type: "divider" });
  }

  const totalResults = updates.reduce((sum, u) => sum + u.results.length, 0);
  const text = `Competitive Intelligence Report: ${totalResults} update(s) across ${updates.length} competitor(s)`;

  return { blocks, text };
}

function escapeSlackText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
