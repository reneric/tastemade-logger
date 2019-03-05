const winston = require('winston');
require('winston-daily-rotate-file');

/**
 *
 * @param {object} app_name - the name of the application
 * @param {object} environment - the name of current environment
 * @returns {array} transports for environment
 */
function getTransports ({ app_name, environment }) {
  // Define transports, files are for beats to transfer to elastic search
  // date pattern is set to have two logs per day, AM and PM
  // resulting in 14 logs every 7 days
  const fileTransport = new (winston.transports.DailyRotateFile)({
    dirname: 'logs',
    filename: `${app_name}-${environment}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-A',
    json: true,
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: false,
  });

  const consoleTransport = new winston.transports.Console({
    handleExceptions: true,
  });

  switch (environment) {
    case 'local':
      return [fileTransport, consoleTransport];
    default:
      return [fileTransport];
  }
}

module.exports = getTransports;
