const url = require('url');
const useragent = require('useragent');
const once = require('lodash.once');

const getRequestUrl = req => url.parse(req.originalUrl);
const getIp = req => req.headers['x-forwarded-for'] || req.ip || req.connection.removeAddress;
const getUserAgent = req => useragent.parse(req.headers['user-agent']).toString();
const getCorrelationId = req => req.correlationId;
const getRequestId = req => req.requestId;
const getSubject = (req) => {
  if (req.headers.authorization) {
    const auth = req.headers.authorization;
    return auth;
  }
  if (req.query.api_key) {
    const auth = {
      apiKey: req.query.api_key,
      token: req.query.auth_token,
    };
    return auth;
  }

  return 'unauthenticated';
};

const getSize = res => res.getHeader('Content-Length') || res._contentLength;

const Middleware = logger => (req, res, next) => {
  const requestedUrl = getRequestUrl(req);
  const requestStartTime = new Date();
  const correlationId = getCorrelationId(req);
  const requestId = getRequestId(req);
  const ip = getIp(req);
  const userAgent = getUserAgent(req);
  const subject = getSubject(req);

  const {
    method,
    body,
    path,
    query,
  } = req;
  const defaultMessage = {
    url (str, segment) { return requestedUrl[segment]; },
    ip,
    subject,
    userAgent,
    method,
    body,
    path,
    query,
  };

  const request = {
    ...defaultMessage,
    message: `Request ${requestId} ${requestId} ${path}`,
  };
  // log the request
  logger.info(request.message, { request, event: 'request', subject, correlationId, requestId });

  const afterResponse = () => {
    const size = getSize(res);
    const response = {
      ...defaultMessage,
      message: `Response ${requestId}`,
      responseTime: (new Date() - requestStartTime),
      statusCode: res.statusCode,
      size,
    };

    // log the response
    logger.info(response.message, { response, event: 'response', subject, correlationId, requestId });
  };

  const oneAfterResponseHandler = once(afterResponse);
  res.on('finish', oneAfterResponseHandler);
  res.on('close', oneAfterResponseHandler);
  return next();
};

module.exports = Middleware;
