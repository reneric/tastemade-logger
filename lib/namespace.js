const { createNamespace, getNamespace } = require('cls-hooked');

const NAMESPACE = 'logger';

const getLoggerNamespace = () => {
  const loggerNamespace = getNamespace(NAMESPACE);
  if (typeof loggerNamespace !== 'undefined') {
    return loggerNamespace;
  }
  return createNamespace(NAMESPACE);
};

const noop = () => (undefined);
module.exports = {
  getLoggerNamespace,
  middleware (req, res, next) {
    const namespace = getLoggerNamespace();
    console.log(req);
    return namespace.run(next);
  },
  /**
   * @callback {contextCallback}
   *
   *
   * Create a new logger context and returns the callback
   * @param {contextCallback} next
   * @returns callback function
   */
  runWithContext (next) {
    const namespace = getLoggerNamespace();
    const nameSpaceAvailable = !!namespace;
    if (nameSpaceAvailable) {
      return namespace.run(next);
    }
    return next();
  },
  /**
   * Adds a value to the logger context by key.  If the key already exists, its value will be overwritten.
   * @param {string} key
   * @param {*} value
   * @returns value, or undefined
   */
  setContext (key, value) {
    const namespace = getLoggerNamespace();
    const nameSpaceAvailable = !!namespace && !!namespace.active;
    if (nameSpaceAvailable) {
      return namespace.set(key, value);
    }
    return noop();
  },
  /**
   * Gets a value from the logger context by key.  Will return undefined if the context has not yet been initialized.
   * @param {string} key
   * @returns value, or undefined
   */
  getContext (key) {
    const namespace = getLoggerNamespace();
    const nameSpaceAvailable = !!namespace && !!namespace.active;
    if (nameSpaceAvailable) {
      return namespace.get(key);
    }
    return noop();
  },
};
