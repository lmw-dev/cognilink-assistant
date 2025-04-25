export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LoggerConfig {
  level: LogLevel;
  includeTimestamp?: boolean;
  timestampFormat?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  includeTimestamp: true,
  timestampFormat: 'HH:mm:ss'
};

export class Logger {
  private context: string;
  private config: LoggerConfig;

  constructor(context: string, config: Partial<LoggerConfig> = {}) {
    this.context = context;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = this.config.includeTimestamp 
      ? `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] `
      : '';
    return `${timestamp}[${this.context}] [${level}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  error(message: string, error?: Error) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMsg = error 
        ? `${message}\nError: ${error.message}\nStack: ${error.stack}`
        : message;
      console.error(this.formatMessage('ERROR', errorMsg));
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  setLevel(level: LogLevel) {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }
} 