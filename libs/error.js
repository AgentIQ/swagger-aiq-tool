'use strict';

// List of validator error types.
const INVALID_FIELD_EXISTS = 'INVALID_FIELD_EXISTS';
const MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD';
const INVALID_ENUM_VALUE = 'INVALID_ENUM_VALUE';
const INVALID_TYPE = 'INVALID_TYPE';
const MIN_ITEM_NUMMER_NOT_MET = 'MIN_ITEM_NUMMER_NOT_MET';
const MAX_ITEM_NUMMER_NOT_MET = 'MAX_ITEM_NUMMER_NOT_MET';
const INCORRECT_SCHEMA = 'INCORRECT_SCHEMA';
const UNKNOWN_REASON = 'UNKNOWN_REASON';
const INVALID_STRING_PATTERN = 'INVALID_STRING_PATTERN';
const INVALID_MIN_LENGTH = 'INVALID_MIN_LENGTH';
const INVALID_MAX_LENGTH = 'INVALID_MAX_LENGTH';
const INVALID_MULTIPLE_OF = 'INVALID_MULTIPLE_OF';
const INVALID_ANY_OF = 'INVALID_ANY_OF';
const INVALID_ALL_OF = 'INVALID_ALL_OF';
const INVALID_ONE_OF = 'INVALID_ONE_OF';

// List of middleware error type
const INVALID_PATH_TYPE = 'INVALID_PATH_TYPE';
const INVALID_PARAMS = 'INVALID_PARAMS';

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
    INVALID_STRING_PATTERN,
    INVALID_MIN_LENGTH,
    INVALID_MAX_LENGTH,
    INVALID_MULTIPLE_OF,
    INVALID_ANY_OF,
    INVALID_ALL_OF,
    INVALID_ONE_OF,
    MIN_ITEM_NUMMER_NOT_MET,
    MAX_ITEM_NUMMER_NOT_MET,
    INVALID_PATH_TYPE,
    INVALID_PARAMS,
    INCORRECT_SCHEMA,
    UNKNOWN_REASON
  }
};
