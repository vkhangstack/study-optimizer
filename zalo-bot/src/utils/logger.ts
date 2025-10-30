interface LogLevel {
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
};

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    const formatted = this.formatMessage(LOG_LEVELS.INFO, message, meta);
    console.log(formatted);
  }

  warn(message: string, meta?: any): void {
    const formatted = this.formatMessage(LOG_LEVELS.WARN, message, meta);
    console.warn(formatted);
  }

  error(message: string, error?: any): void {
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, error);
    console.error(formatted);
    
    if (this.isDevelopment && error?.stack) {
      console.error(error.stack);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message, meta);
      console.debug(formatted);
    }
  }
}

export const logger = new Logger();