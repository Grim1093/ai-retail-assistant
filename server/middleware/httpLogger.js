const logger = require('../utils/logger');

const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    logger.info(`HTTP Request`, {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = httpLogger;
