const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Enterprise logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'rownaa-api' },
  transports: [
    // Write all error logs to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs (info and below) to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// If we're not in production, also log to the console with custom formatting
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
