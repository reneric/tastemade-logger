const { format } = require('winston');
const { getContext } = require('../lib/namespace');

const formatter = (loggingObject, options = {}) => {
  const {
    app_name = loggingObject.app_name,
    environment = loggingObject.environment,
    metadata,
    requestId = getContext('requestId') || loggingObject.requestId,
    correlationId = getContext('correlationId') || loggingObject.correlationId,
  } = options;
  const {
    message = 'TM Kitchen Default Message',
  } = loggingObject;

  if (metadata) {
    return {
      ...loggingObject,
      app_name,
      environment,
      requestId,
      correlationId,
      message,
      metadata,
    };
  }

  return {
    ...loggingObject,
    app_name,
    environment,
    requestId,
    correlationId,
    message,
  };
};

/**
 * @param {object} info - passed in by parent function of combine/format from winston
 * @param {object} opts - options passed into the logger
 */
const logFormat = format((info, options) => formatter(info, options));

module.exports = {
  logFormat,
  formatter,
};
