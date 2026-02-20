import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.TAVILY_API_KEY = "tvly-test-key";
    process.env.SLACK_BOT_TOKEN = "xoxb-test-token";
    process.env.SLACK_CHANNEL_ID = "C1234567890";
    process.env.COMPETITORS = "acme.com,globex.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load config from environment variables", () => {
    const config = loadConfig();

    expect(config.tavily.apiKey).toBe("tvly-test-key");
    expect(config.slack.botToken).toBe("xoxb-test-token");
    expect(config.slack.channelId).toBe("C1234567890");
    expect(config.competitors).toEqual(["acme.com", "globex.com"]);
  });

  it("should use default values for optional variables", () => {
    const config = loadConfig();

    expect(config.tavily.searchDepth).toBe("basic");
    expect(config.searchIntervalCron).toBe("0 9 * * 1-5");
    expect(config.logLevel).toBe("info");
  });

  it("should throw if TAVILY_API_KEY is missing", () => {
    delete process.env.TAVILY_API_KEY;
    expect(() => loadConfig()).toThrow("Missing required environment variable: TAVILY_API_KEY");
  });

  it("should throw if SLACK_BOT_TOKEN is missing", () => {
    delete process.env.SLACK_BOT_TOKEN;
    expect(() => loadConfig()).toThrow("Missing required environment variable: SLACK_BOT_TOKEN");
  });

  it("should throw if SLACK_CHANNEL_ID is missing", () => {
    delete process.env.SLACK_CHANNEL_ID;
    expect(() => loadConfig()).toThrow("Missing required environment variable: SLACK_CHANNEL_ID");
  });

  it("should throw if COMPETITORS is missing", () => {
    delete process.env.COMPETITORS;
    expect(() => loadConfig()).toThrow("Missing required environment variable: COMPETITORS");
  });

  it("should throw if COMPETITORS is empty", () => {
    process.env.COMPETITORS = "  ,  ,  ";
    expect(() => loadConfig()).toThrow("COMPETITORS must contain at least one competitor");
  });

  it("should trim whitespace from competitor names", () => {
    process.env.COMPETITORS = " acme.com , globex.com , initech.com ";
    const config = loadConfig();
    expect(config.competitors).toEqual(["acme.com", "globex.com", "initech.com"]);
  });

  it("should accept valid search depth values", () => {
    process.env.TAVILY_SEARCH_DEPTH = "advanced";
    const config = loadConfig();
    expect(config.tavily.searchDepth).toBe("advanced");
  });

  it("should throw for invalid search depth", () => {
    process.env.TAVILY_SEARCH_DEPTH = "ultra";
    expect(() => loadConfig()).toThrow('Invalid TAVILY_SEARCH_DEPTH: ultra');
  });

  it("should accept valid log levels", () => {
    process.env.LOG_LEVEL = "debug";
    const config = loadConfig();
    expect(config.logLevel).toBe("debug");
  });

  it("should throw for invalid log level", () => {
    process.env.LOG_LEVEL = "verbose";
    expect(() => loadConfig()).toThrow('Invalid LOG_LEVEL: verbose');
  });
});
