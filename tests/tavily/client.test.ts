import { describe, it, expect, vi, beforeEach } from "vitest";
import { TavilyClient } from "../../src/tavily/client";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("TavilyClient", () => {
  let client: TavilyClient;

  beforeEach(() => {
    client = new TavilyClient("tvly-test-key");
    mockFetch.mockReset();
  });

  describe("search", () => {
    it("should send a POST request with the query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: "test",
          results: [],
          response_time: 0.5,
        }),
      });

      await client.search({ query: "test competitor news" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.tavily.com/search",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer tvly-test-key",
          },
        })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).toBe("test competitor news");
    });

    it("should return parsed search results", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: "acme",
          results: [
            { title: "Acme News", url: "https://example.com", content: "Content", score: 0.9 },
          ],
          response_time: 0.3,
        }),
      });

      const response = await client.search({ query: "acme" });
      expect(response.results).toHaveLength(1);
      expect(response.results[0].title).toBe("Acme News");
    });

    it("should throw on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      await expect(client.search({ query: "test" })).rejects.toThrow("Tavily search failed (401): Unauthorized");
    });
  });

  describe("extract", () => {
    it("should send a POST request with URLs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ url: "https://example.com", raw_content: "content" }],
          failed_results: [],
          response_time: 1.0,
        }),
      });

      await client.extract({ urls: ["https://example.com"] });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.tavily.com/extract",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should throw on non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(client.extract({ urls: "https://example.com" })).rejects.toThrow(
        "Tavily extract failed (500): Internal Server Error"
      );
    });
  });
});
