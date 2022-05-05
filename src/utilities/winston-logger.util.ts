import path from 'path';
import { fileURLToPath } from 'url';
import Winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const { colorize, combine, timestamp: defaultTimestamp, printf, splat, json } = Winston.format;

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
const formatted = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

class WinstonLogger {
  private static instance: WinstonLogger;

  private logger: Winston.Logger;

  private constructor() {
    this.logger = Winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(splat(), json(), defaultTimestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), formatted),
      transports: [
        new WinstonDaily({
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          dirname: path.join(dirName, '..', 'logs'),
          filename: '%DATE%.error.log',
          maxFiles: 100,
          zippedArchive: false,
        }),
        new WinstonDaily({
          level: 'debug',
          datePattern: 'YYYY-MM-DD',
          dirname: path.join(dirName, '..', 'logs'),
          filename: '%DATE%.combined.log',
          maxFiles: 100,
          zippedArchive: false,
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new Winston.transports.Console({
          format: combine(colorize(), formatted),
        }),
      );
    }
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new WinstonLogger();
    }

    return this.instance.logger;
  }
}

const Logger = WinstonLogger.getInstance();

export { Logger };
