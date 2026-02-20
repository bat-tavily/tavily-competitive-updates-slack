type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: number;

  constructor(level: LogLevel = "info") {
    this.level = LOG_LEVELS[level];
  }

  setLevel(level: LogLevel): void {
    this.level = LOG_LEVELS[level];
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LOG_LEVELS.debug) {
      this.log("DEBUG", message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LOG_LEVELS.info) {
      this.log("INFO", message, context);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LOG_LEVELS.warn) {
      this.log("WARN", message, context);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LOG_LEVELS.error) {
      this.log("ERROR", message, context);
    }
  }

  private log(level: string, message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] ${level}: ${message}`;
    if (context) {
      console.log(base, JSON.stringify(context));
    } else {
      console.log(base);
    }
  }
}

export const logger = new Logger();
