const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

module.exports.debug = logger.debug;
module.exports.info = logger.info;
module.exports.warn = logger.warn;
module.exports.error = logger.error;
