'use strict';

// List of error types.
const INVALID_FIELD_EXISTS = 'INVALID_FIELD_EXISTS';
const MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD';
const INVALID_ENUM_VALUE = 'INVALID_ENUM_VALUE';
const INVALID_TYPE = 'INVALID_TYPE';
const MIN_ITEM_NUMMER_NOT_MET = 'MIN_ITEM_NUMMER_NOT_MET';
const INCORRECT_SCHEMA = 'INCORRECT_SCHEMA';
const UNKNOWN_REASON = 'UNKNOWN_REASON';

/**
 * Format error and throw exception.
 */
function throwError(name, reason, path, extra=null) {
  let error = new Error(reason);
  if (extra) {
    extra = extra.map(err => err.results);
  }

  error.code = 'SCHEMA_VALIDATION_FAILED';
  error.results = {
    name, reason, path, extra
  };
  throw error;
}

module.exports = { throwError, 
  error_type: {
    INVALID_FIELD_EXISTS,
    MISSING_REQUIRED_FIELD,
    INVALID_ENUM_VALUE,
    INVALID_TYPE,
    MIN_ITEM_NUMMER_NOT_MET,
    INCORRECT_SCHEMA,
    UNKNOWN_REASON
  }
};
