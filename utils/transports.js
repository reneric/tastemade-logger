const { transports } = require('winston');
transports.DailyRotateFile = require('winston-daily-rotate-file');

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
  // Zipping causes problems with filebeat
  const fileTransport = new transports.DailyRotateFile({
    dirname: 'logs',
    filename: `${app_name}-${environment}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-A',
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: false,
  });

  const consoleTransport = new transports.Console({
    handleExceptions: true,
  });

  switch (environment) {
    case 'local':
      return [consoleTransport];
    default:
      return [consoleTransport];
  }
}

module.exports = getTransports;
