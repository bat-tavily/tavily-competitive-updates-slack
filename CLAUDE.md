# CLAUDE.md

## Project Overview

**tavily-competitive-updates-slack** is a service that uses the [Tavily API](https://docs.tavily.com) to monitor competitors and deliver competitive intelligence updates to Slack channels. It periodically searches for news, product changes, and market activity related to configured competitors, then formats and posts summaries to designated Slack channels.

## Repository Status

This is a greenfield project. When building out the codebase, follow the conventions below.

## Tech Stack

- **Language**: TypeScript (Node.js)
- **Runtime**: Node.js 20+
- **Package Manager**: npm
- **APIs**:
  - [Tavily Search/Extract API](https://docs.tavily.com) — web search and content extraction for competitive intelligence
  - [Slack Web API](https://api.slack.com/web) (via `@slack/web-api`) — posting messages to Slack channels
- **Scheduling**: node-cron or similar for periodic execution

## Project Structure (Target)

```
tavily-competitive-updates-slack/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Configuration loading and validation
│   ├── tavily/
│   │   ├── client.ts         # Tavily API client wrapper
│   │   └── types.ts          # Tavily request/response types
│   ├── slack/
│   │   ├── client.ts         # Slack API client wrapper
│   │   └── formatter.ts      # Message formatting (Block Kit)
│   ├── competitors/
│   │   └── tracker.ts        # Competitor monitoring logic
│   └── scheduler.ts          # Cron/scheduling logic
├── tests/
│   └── ...                   # Mirror of src/ structure
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `TAVILY_API_KEY` | API key for Tavily search/extract | Yes |
| `SLACK_BOT_TOKEN` | Slack Bot OAuth token (`xoxb-...`) | Yes |
| `SLACK_CHANNEL_ID` | Default Slack channel for updates | Yes |
| `COMPETITORS` | Comma-separated list of competitor names/domains | Yes |
| `SEARCH_INTERVAL_CRON` | Cron expression for search frequency (default: `0 9 * * 1-5`) | No |
| `TAVILY_SEARCH_DEPTH` | Search depth: `basic` or `advanced` (default: `basic`) | No |
| `LOG_LEVEL` | Logging level: `debug`, `info`, `warn`, `error` (default: `info`) | No |

Never commit `.env` files. Use `.env.example` as a template with placeholder values only.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint

# Lint and fix
npm run lint:fix

# Type check
npm run typecheck
```

## Coding Conventions

### TypeScript
- Use strict TypeScript (`"strict": true` in tsconfig)
- Prefer `interface` over `type` for object shapes
- Use explicit return types on exported functions
- Use `const` by default; `let` only when reassignment is needed; never `var`
- Use async/await over raw Promises

### Error Handling
- Wrap all external API calls (Tavily, Slack) in try/catch blocks
- Log errors with structured context (competitor name, search query, etc.)
- Fail gracefully: if one competitor search fails, continue with the rest
- Never expose API keys or tokens in error messages or logs

### Slack Messages
- Use [Block Kit](https://api.slack.com/block-kit) for message formatting
- Keep messages concise and scannable
- Include source URLs for all competitive intelligence items
- Use timestamps and competitor names as headers

### API Usage
- Respect Tavily rate limits; implement backoff if needed
- Cache results when appropriate to avoid redundant API calls
- Use `search_depth: "advanced"` only when basic results are insufficient

### Testing
- Write unit tests for business logic (formatting, parsing, filtering)
- Mock external API calls (Tavily, Slack) in tests
- Use descriptive test names: `it("should filter out results older than 7 days")`

### Git
- Write concise commit messages in imperative mood ("Add competitor tracking", not "Added competitor tracking")
- One logical change per commit
- Never commit secrets, `.env` files, or `node_modules/`

## Key Design Decisions

1. **Tavily Search API** is the primary data source for competitive intelligence. Use the Search API for broad monitoring and the Extract API for deep-diving specific pages.
2. **Slack Block Kit** is used for message formatting to provide rich, structured updates.
3. **Graceful degradation**: If Tavily or Slack APIs are unavailable, log the error and retry on the next scheduled run rather than crashing.
4. **Configuration-driven**: Competitor lists and search parameters should be configurable via environment variables or a config file, not hardcoded.

## Security Notes

- All API keys must be stored in environment variables, never in source code
- `.env` must be in `.gitignore`
- Validate and sanitize any external input before using it in API calls
- Use HTTPS for all external API communication (Tavily and Slack both enforce this)
