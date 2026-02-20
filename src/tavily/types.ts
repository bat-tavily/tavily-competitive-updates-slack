export interface TavilySearchRequest {
  query: string;
  search_depth?: "basic" | "advanced";
  topic?: "general" | "news";
  time_range?: "day" | "week" | "month" | "year";
  max_results?: number;
  include_answer?: boolean;
  include_raw_content?: boolean;
  include_domains?: string[];
  exclude_domains?: string[];
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
  response_time: number;
}

export interface TavilyExtractRequest {
  urls: string | string[];
  query?: string;
  extract_depth?: "basic" | "advanced";
  format?: "markdown" | "text";
  timeout?: number;
}

export interface TavilyExtractResult {
  url: string;
  raw_content: string;
}

export interface TavilyExtractFailedResult {
  url: string;
  error: string;
}

export interface TavilyExtractResponse {
  results: TavilyExtractResult[];
  failed_results: TavilyExtractFailedResult[];
  response_time: number;
}
