const url = require('url');
const useragent = require('useragent');
const decodeJWT = require('jwt-decode');
const once = require('lodash.once');

const getRequestUrl = req => url.parse(req.originalUrl);
const getIp = req => req.headers['x-forwarded-for'] || req.ip || req.connection.removeAddress;
const getUserAgent = req => useragent.parse(req.headers['user-agent']).toString();
const getSubject = (req) => {
  if (req.headers.authorization) {
    try {
      const auth = decodeJWT(req.headers.authorization);
      return auth;
    } catch (err) {
      if (err instanceof decodeJWT.InvalidTokenError) return 'unauthenticated';
      throw err;
    }
  }

  return 'unauthenticated';
};

const getSize = res => res.getHeader('Content-Length') || res._contentLength;

const Middleware = logger => (req, res, next) => {
  const requestedUrl = getRequestUrl(req);
  const requestStartTime = new Date();
  const ip = getIp(req);
  const userAgent = getUserAgent(req);
  const subject = getSubject(req);
  const {
    method,
    body,
    path,
    query,
  } = req;
  console.log(logger);
  console.log(req);

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
    message: 'request',
  };

  // log the request
  logger.info(request.message, { request, event: 'request', subject });

  const afterResponse = () => {
    const size = getSize(res);
    const response = {
      ...defaultMessage,
      message: 'response',
      responseTime: (new Date() - requestStartTime),
      statusCode: res.statusCode,
      size,
    };

    // log the response
    logger.info(response.message, { response, event: 'response', subject });
  };

  const oneAfterResponseHandler = once(afterResponse);
  res.on('finish', oneAfterResponseHandler);
  res.on('close', oneAfterResponseHandler);
  return next();
};

module.exports = Middleware;
