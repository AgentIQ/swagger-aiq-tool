'use strict';
const { Validator } = require('./validator');
const { error_type } = require('./error');
const { INVALID_PATH_TYPE, INVALID_PARAMS } = error_type;

/**
 * Create middleware.
 */
function createMiddleWare(swaggerSchema) {
  const validator = new Validator(swaggerSchema.definitions);

  /**
   * Compare two paths and return true if matched.
   *
   * It has path matches for followings.
   * - Concrete path notation such as /path/to and /path/to.
   * - Variable path notation such as /path/{id} and /path/2332.
   */
  function _comparePaths(path1, path2) {
    const toks1 = path1.split('/');
    const toks2 = path2.split('/');

    if (toks1.length !== toks2.length) {
      return false;
    }

    // now we have a same length
    for (let i = 0; i < toks1.length; i++) {
      // Skip if the schema path has a variable path.
      if (toks1[i].startsWith('{') && toks1[i].endsWith('}')) {
        continue;
      }

      if (toks1[i] !== toks2[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get schema from swagger doc.
   */
  function getSchemaObject(swaggerSchema, matchedPath, requestType) {
    if (!swaggerSchema || !swaggerSchema.paths || !matchedPath || !requestType) {
      return null;
    }

    if (!swaggerSchema.paths.hasOwnProperty(matchedPath)) {
      return null;
    }

    for (let type in swaggerSchema.paths[matchedPath]) {
      if (type === requestType) {
        return swaggerSchema.paths[matchedPath][requestType];
      }
    }
    return null;
  }

  /**
   * Find an appropriate path from schema and return it.
   */
  function findRequestPath (swaggerSchema, path) {
    if (!swaggerSchema || !swaggerSchema.paths || !path) {
      return null;
    }

    for (let key in swaggerSchema.paths) {
      if (_comparePaths(key, path)) {
        return key;
      }
    }

    return null;
  }

  /**
   * Validate url path
   */
  function validatePath(parameter, matchedPath, requestPath) {
    function extractNameValueFromPath(name, matchedPath, requestPath) {
      const token = '{' + name + '}';
      const matchedFields = matchedPath.split('/');
      const requestFields = requestPath.split('/');

      const idx = matchedFields.findIndex((field) => token === field);
      if (idx >= 0) {
        return (requestFields.length > idx) ? requestFields[idx]: null;
      } else {
        return null;
      }
    }

    return Promise.resolve()
      .then(() => {
        if (parameter.name && parameter.type) {
          const value = extractNameValueFromPath(parameter.name, matchedPath, requestPath);
          return validator.validateType(parameter, value, ['paths']);
        } else {
          // TODO(jaewkwan): may need to always throw exception.
        }
      })
      .catch(err => {
        err.results.name = INVALID_PATH_TYPE;
        throw err;
      });
  }

  /**
   * Validate a parameter.
   */
  function validateParam(parameter, params) {
    return Promise.resolve()
      .then(() => {
        if (parameter.name && parameter.type) {
          if (params[parameter.name]) {
            return validator.validateType(parameter, params[parameter.name], ['parameters']);
          }
        }
      })
      .catch(err => {
        err.results.name = INVALID_PARAMS;
        throw err;
      });
  }

  /**
   * Middleware
   */
  return function (req, res, next) {
    const requestPath = req.url || '';
    const requestType = req.method.toLowerCase() || '';
    const requestPayload = req.body || '';
    const requestParams = req.params || '';
    const matchedPath = findRequestPath(swaggerSchema, requestPath);
    const schemaObject = getSchemaObject(swaggerSchema, matchedPath, requestType);

    if (!schemaObject) {
      // Skip validation if schema doesn't exist.
      return next();
    }

    const parameters = schemaObject.parameters || [];
    if (parameters.length === 0) {
      // Skip validation if parameters doesn't exist.
      return next();
    }

    let promises = [];
    for (let param of parameters) {
      switch (param.in) {
        case 'query':
          promises.push(validateParam(param, requestParams));
          break;
        case 'path':
          promises.push(validatePath(param, matchedPath, requestPath));
          break;
        case 'body':
          if (param.schema){
            promises.push(validator.validate(param.schema, requestPayload));
          }
          break;
      }
    }

    Promise.all(promises)
      .then(() => next())
      .catch(err => next(err));
  };
}

module.exports = { createMiddleWare };
