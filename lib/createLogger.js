const { createLogger, format } = require('winston');

const { combine, timestamp, json } = format;
const { logFormat } = require('../utils/format');
const getTransportsForEnv = require('../utils/transports');

/**
 * This is the Tastemade logger wrapped around Winston's createLogger
 * @param {object} options - An object to pass options to the logger
 * @param {string} options.app_name - This is the application name, appended to each entry, can be added in metadata
 * @param {string} options.environment - This will be used to determine what transports to use.
 *                                    This falls back to process.env.NODE_ENV
 * @param {object} options.metadata - This object will be added directly to the logging object
 */
const Logger = (options = {}) => {
  const {
    environment = (process.env.NODE_ENV || 'ENV_UNKNOWN'),
    app_name = (process.env.APP_NAME || 'APP_UNKNOWN'),
    level = 'info',
  } = options;

  const loggerOptions = { ...options, environment, app_name };
  const transports = getTransportsForEnv(loggerOptions);

  return createLogger({
    exitOnError: false,
    format: combine(
      timestamp(),
      logFormat(loggerOptions),
      json()
    ),
    level,
    transports,
  });
};

module.exports = Logger;
