const uuid = require('uuid');
const httpContext = require('express-http-context');
const createLogger = require('./lib/createLogger');
const Middleware = require('./lib/middleware');
const namespace = require('./lib/namespace');

let logger;

/**
 * initializeLogger
 * @param {object} options - The loggers options
 * @returns logger
 */
const initializeLogger = (options = {}) => {
  const { enableMiddleware = false } = options;
  logger = new Proxy(createLogger({ ...options, enableMiddleware }), {
    get (target, key) {
      return Reflect.get(target, key);
    },
  });

  return logger;
};

/**
 * middleware
 * @param app - The express application
 * @param {object} options - The loggers options
 * @returns logger
 */
const middleware = (app, options = {}) => {
  if (typeof logger === 'undefined') {
    initializeLogger({ ...options, enableMiddleware: true });
  }

  app.use(httpContext.middleware);

  // Run the context for each request. Assign a unique identifier to each request
  app.use((req, res, next) => {
    const correlationId = req.get('X-Correlation-ID') || uuid.v4();
    const requestId = uuid.v4();
    httpContext.set('correlationId', correlationId);
    httpContext.set('requestId', requestId);
    httpContext.set('processId', process.pid);
    // make these available as part of the request for other middleware
    req.correlationId = correlationId;
    req.requestId = requestId;
    res.set('X-Correlation-ID', correlationId);
    res.set('X-Request-ID', requestId);

    return next();
  });

  app.use(Middleware(logger));

  return logger;
};

/**
 * getLogger
 * This returns an instance of the modified Winston logger
 * @returns logger
 */
const getLogger = () => {
  if (typeof logger === 'undefined') {
    throw new Error('Logger has not been initialized');
  }

  return logger;
};

/**
 * getCorrelationId
 * This returns the correlationId from the current context
 * @returns value or undefined
 */
const getCorrelationId = () => {
  if (typeof logger === 'undefined') {
    throw new Error('Logger has not been initialized');
  }

  return httpContext.get('correlationId') || namespace.getContext('correlationId');
};

module.exports = {
  initializeLogger,
  getLogger,
  middleware,
  namespace,
  getCorrelationId,
};
