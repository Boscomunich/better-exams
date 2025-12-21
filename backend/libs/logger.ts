import * as winston from 'winston';
import * as path from 'path'; // ← FIX
import * as DailyRotateFile from 'winston-daily-rotate-file';

// Levels & colors
const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors: Record<keyof typeof levels, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.config.addColors(colors);

// Formats
const fileFormat: winston.Logform.Format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat: winston.Logform.Format = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf((info) => {
    const timestamp = typeof info.timestamp === 'string' ? info.timestamp : '';
    const level = typeof info.level === 'string' ? info.level : '';
    const message =
      typeof info.message === 'string'
        ? info.message
        : JSON.stringify(info.message);
    const context =
      info.context && typeof info.context === 'string'
        ? `[${info.context}]`
        : '';
    return `${timestamp} ${level}: ${message} ${context}`;
  }),
);

// Logs directory
const logDir = 'logs';

// Create logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: fileFormat,
  defaultMeta: {
    service: 'eduguard-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      handleExceptions: true,
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      handleExceptions: true,
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
    }),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
    }),
  );
}

export const createLoggerWithContext = (context: string) => {
  const wrap =
    (method: winston.LeveledLogMethod) =>
    (message: string, meta?: Record<string, unknown>) => {
      method.call(logger, message, { ...meta, context });
    };

  return {
    error: wrap(logger.error),
    warn: wrap(logger.warn),
    info: wrap(logger.info),
    http: wrap(logger.http),
    debug: wrap(logger.debug),
  } as const;
};

export type LoggerContext = ReturnType<typeof createLoggerWithContext>;
