import type {
  TavilySearchRequest,
  TavilySearchResponse,
  TavilyExtractRequest,
  TavilyExtractResponse,
} from "./types";
import { logger } from "../logger";

const TAVILY_BASE_URL = "https://api.tavily.com";

export class TavilyClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(request: TavilySearchRequest): Promise<TavilySearchResponse> {
    logger.debug(`Tavily search: "${request.query}"`);

    const response = await fetch(`${TAVILY_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Tavily search failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as TavilySearchResponse;
    logger.debug(`Tavily search returned ${data.results.length} results in ${data.response_time}s`);
    return data;
  }

  async extract(request: TavilyExtractRequest): Promise<TavilyExtractResponse> {
    const urls = Array.isArray(request.urls) ? request.urls : [request.urls];
    logger.debug(`Tavily extract: ${urls.length} URL(s)`);

    const response = await fetch(`${TAVILY_BASE_URL}/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Tavily extract failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as TavilyExtractResponse;
    logger.debug(`Tavily extract returned ${data.results.length} results in ${data.response_time}s`);
    return data;
  }
}
