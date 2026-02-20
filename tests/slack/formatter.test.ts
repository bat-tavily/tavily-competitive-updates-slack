import { describe, it, expect } from "vitest";
import {
  formatCompetitorUpdate,
  formatSummaryMessage,
  type CompetitorUpdate,
} from "../../src/slack/formatter";
import type { TavilySearchResult } from "../../src/tavily/types";

function makeResult(overrides: Partial<TavilySearchResult> = {}): TavilySearchResult {
  return {
    title: "Test Article",
    url: "https://example.com/article",
    content: "This is a test article about a competitor.",
    score: 0.95,
    ...overrides,
  };
}

function makeUpdate(overrides: Partial<CompetitorUpdate> = {}): CompetitorUpdate {
  return {
    competitor: "Acme Corp",
    results: [makeResult()],
    searchedAt: new Date("2026-02-20T09:00:00Z"),
    ...overrides,
  };
}

describe("formatCompetitorUpdate", () => {
  it("should include a header with the competitor name", () => {
    const blocks = formatCompetitorUpdate(makeUpdate());
    const header = blocks.find((b) => b.type === "header");
    expect(header).toBeDefined();
    expect(header).toMatchObject({
      type: "header",
      text: { type: "plain_text", text: "Acme Corp — Competitive Update" },
    });
  });

  it("should include a context block with the date and result count", () => {
    const blocks = formatCompetitorUpdate(makeUpdate());
    const context = blocks.find((b) => b.type === "context");
    expect(context).toBeDefined();
  });

  it("should include section blocks for each result", () => {
    const update = makeUpdate({
      results: [
        makeResult({ title: "Article 1", url: "https://example.com/1" }),
        makeResult({ title: "Article 2", url: "https://example.com/2" }),
      ],
    });
    const blocks = formatCompetitorUpdate(update);
    const sections = blocks.filter((b) => b.type === "section");
    expect(sections).toHaveLength(2);
  });

  it("should show a message when there are no results", () => {
    const update = makeUpdate({ results: [] });
    const blocks = formatCompetitorUpdate(update);
    const sections = blocks.filter((b) => b.type === "section");
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      type: "section",
      text: { type: "mrkdwn", text: expect.stringContaining("No new updates") },
    });
  });

  it("should truncate long content to 300 characters", () => {
    const longContent = "A".repeat(400);
    const update = makeUpdate({ results: [makeResult({ content: longContent })] });
    const blocks = formatCompetitorUpdate(update);
    const section = blocks.find((b) => b.type === "section" && "text" in b && b.text?.text?.includes("AAA"));
    expect(section).toBeDefined();
    if (section && "text" in section && section.text) {
      expect(section.text.text).toContain("...");
    }
  });

  it("should escape special Slack characters in titles and content", () => {
    const update = makeUpdate({
      results: [makeResult({ title: "A < B & C > D", content: "x < y" })],
    });
    const blocks = formatCompetitorUpdate(update);
    const section = blocks.find(
      (b) => b.type === "section" && "text" in b && b.text?.text?.includes("&amp;")
    );
    expect(section).toBeDefined();
  });
});

describe("formatSummaryMessage", () => {
  it("should return blocks and a fallback text", () => {
    const updates = [makeUpdate()];
    const { blocks, text } = formatSummaryMessage(updates);

    expect(blocks.length).toBeGreaterThan(0);
    expect(text).toContain("1 update(s)");
    expect(text).toContain("1 competitor(s)");
  });

  it("should include a header block", () => {
    const { blocks } = formatSummaryMessage([makeUpdate()]);
    const header = blocks.find((b) => b.type === "header");
    expect(header).toMatchObject({
      type: "header",
      text: { type: "plain_text", text: "Competitive Intelligence Report" },
    });
  });

  it("should sum results from multiple competitors", () => {
    const updates = [
      makeUpdate({ competitor: "A", results: [makeResult(), makeResult()] }),
      makeUpdate({ competitor: "B", results: [makeResult()] }),
    ];
    const { text } = formatSummaryMessage(updates);
    expect(text).toContain("3 update(s)");
    expect(text).toContain("2 competitor(s)");
  });
});
