import dotenv from "dotenv";

dotenv.config();

type LogLevel = "debug" | "info" | "warn" | "error";
type SearchDepth = "basic" | "advanced";

export interface Config {
  tavily: {
    apiKey: string;
    searchDepth: SearchDepth;
  };
  slack: {
    botToken: string;
    channelId: string;
  };
  competitors: string[];
  searchIntervalCron: string;
  logLevel: LogLevel;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  const searchDepth = (process.env.TAVILY_SEARCH_DEPTH || "basic") as SearchDepth;
  if (searchDepth !== "basic" && searchDepth !== "advanced") {
    throw new Error(`Invalid TAVILY_SEARCH_DEPTH: ${searchDepth}. Must be "basic" or "advanced".`);
  }

  const logLevel = (process.env.LOG_LEVEL || "info") as LogLevel;
  if (!["debug", "info", "warn", "error"].includes(logLevel)) {
    throw new Error(`Invalid LOG_LEVEL: ${logLevel}. Must be "debug", "info", "warn", or "error".`);
  }

  const competitorsRaw = requireEnv("COMPETITORS");
  const competitors = competitorsRaw
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (competitors.length === 0) {
    throw new Error("COMPETITORS must contain at least one competitor.");
  }

  return {
    tavily: {
      apiKey: requireEnv("TAVILY_API_KEY"),
      searchDepth,
    },
    slack: {
      botToken: requireEnv("SLACK_BOT_TOKEN"),
      channelId: requireEnv("SLACK_CHANNEL_ID"),
    },
    competitors,
    searchIntervalCron: process.env.SEARCH_INTERVAL_CRON || "0 9 * * 1-5",
    logLevel,
  };
}
