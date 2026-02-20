import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompetitorTracker } from "../../src/competitors/tracker";
import type { Config } from "../../src/config";

vi.mock("../../src/tavily/client", () => {
  return {
    TavilyClient: vi.fn().mockImplementation(() => ({
      search: vi.fn(),
    })),
  };
});

vi.mock("../../src/slack/client", () => {
  return {
    SlackClient: vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
    })),
  };
});

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    tavily: { apiKey: "tvly-test", searchDepth: "basic" },
    slack: { botToken: "xoxb-test", channelId: "C123" },
    competitors: ["acme.com", "globex.com"],
    searchIntervalCron: "0 9 * * 1-5",
    logLevel: "error",
    ...overrides,
  };
}

describe("CompetitorTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should instantiate without errors", () => {
    const tracker = new CompetitorTracker(makeConfig());
    expect(tracker).toBeDefined();
  });

  it("should call runUpdate without throwing when APIs return results", async () => {
    const { TavilyClient } = await import("../../src/tavily/client");
    const { SlackClient } = await import("../../src/slack/client");

    const mockSearch = vi.fn().mockResolvedValue({
      query: "test",
      results: [
        { title: "News", url: "https://example.com", content: "Content", score: 0.9 },
      ],
      response_time: 0.5,
    });
    const mockPostMessage = vi.fn().mockResolvedValue(undefined);

    vi.mocked(TavilyClient).mockImplementation(
      () => ({ search: mockSearch, extract: vi.fn() }) as any
    );
    vi.mocked(SlackClient).mockImplementation(
      () => ({ postMessage: mockPostMessage }) as any
    );

    const tracker = new CompetitorTracker(makeConfig());
    await tracker.runUpdate();

    expect(mockSearch).toHaveBeenCalledTimes(2); // two competitors
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
  });

  it("should continue with remaining competitors if one search fails", async () => {
    const { TavilyClient } = await import("../../src/tavily/client");
    const { SlackClient } = await import("../../src/slack/client");

    const mockSearch = vi
      .fn()
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({
        query: "globex",
        results: [{ title: "News", url: "https://example.com", content: "Content", score: 0.9 }],
        response_time: 0.5,
      });
    const mockPostMessage = vi.fn().mockResolvedValue(undefined);

    vi.mocked(TavilyClient).mockImplementation(
      () => ({ search: mockSearch, extract: vi.fn() }) as any
    );
    vi.mocked(SlackClient).mockImplementation(
      () => ({ postMessage: mockPostMessage }) as any
    );

    const tracker = new CompetitorTracker(makeConfig());
    await tracker.runUpdate();

    expect(mockSearch).toHaveBeenCalledTimes(2);
    expect(mockPostMessage).toHaveBeenCalledTimes(1); // still posts for the one that succeeded
  });

  it("should skip Slack notification if all competitor searches fail", async () => {
    const { TavilyClient } = await import("../../src/tavily/client");
    const { SlackClient } = await import("../../src/slack/client");

    const mockSearch = vi.fn().mockRejectedValue(new Error("API error"));
    const mockPostMessage = vi.fn();

    vi.mocked(TavilyClient).mockImplementation(
      () => ({ search: mockSearch, extract: vi.fn() }) as any
    );
    vi.mocked(SlackClient).mockImplementation(
      () => ({ postMessage: mockPostMessage }) as any
    );

    const tracker = new CompetitorTracker(makeConfig());
    await tracker.runUpdate();

    expect(mockPostMessage).not.toHaveBeenCalled();
  });
});
