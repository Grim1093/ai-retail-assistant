const winston = require('winston');
const path = require('path');
const { combine, timestamp, printf, colorize, errors, splat, json } = winston.format;

// Custom format for file logging
// We use json() for file logs as it is safer and standard for parsing tools,
// but the user requested "text" files implicitly by naming them .log and asking for "robustness".
// However, the previous implementation used a custom printf.
// I will keep the custom printf but make it safer.

const logFormat = printf(({ timestamp, level, message, stack, ...meta }) => {
  let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;

  if (stack) {
    logMessage += `\n${stack}`;
  }

  if (Object.keys(meta).length) {
    // safe-stable-stringify could be better, but we will rely on a simple try-catch or json.
    try {
        logMessage += ` ${JSON.stringify(meta)}`;
    } catch (e) {
        logMessage += ` [Circular/Invalid JSON]`;
    }
  }

  return logMessage;
});

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }), // Capture stack trace
  logFormat
);

// Custom format for console logging
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
      let logMessage = `${timestamp} [${level}]: ${message}`;
      if (stack) logMessage += `\n${stack}`;
      if (Object.keys(meta).length) {
          try {
              logMessage += ` ${JSON.stringify(meta)}`;
          } catch (e) {
            logMessage += ` [Circular]`;
          }
      }
      return logMessage;
  })
);

const logger = winston.createLogger({
  level: 'info',
  transports: [
    // - Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: fileFormat,
    }),
    // - Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: fileFormat,
    }),
  ],
});

// Ensure it logs to the console with colors during development
logger.add(new winston.transports.Console({
  format: consoleFormat,
}));

// Helper function for step-by-step tracing
// Usage: logger.trace("Step 1", "Received Data", { ...data })
logger.trace = (step, message, meta = {}) => {
  logger.info(`[TRACE] ${step}: ${message}`, meta);
};

module.exports = logger;
