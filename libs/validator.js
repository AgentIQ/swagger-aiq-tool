'use strict';
/*
 * Json Validator
 *
 * Reference: https://cswr.github.io/JsonSchema/spec/definitions_references/
 */

const { throwError, error_type } = require('./error');
const {
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
  INCORRECT_SCHEMA,
  UNKNOWN_REASON
} = error_type;

// List of type support
const SWAGGER_SUPPORTED_TYPES = ['string', 'boolean', 'integer', 'number', 'object', 'array'];

/**
 * Schema validator.
 *
 * TODO: support anyOf, allOf, oneOf, and not
 */
function Validator(swaggerDefinitions) {
  const definitions = swaggerDefinitions || {};

  // Validation interface.
  this.validate = function (schema, payload) {
    return new Promise((resolve, reject) => {
      try {
        validateSchema(schema, payload);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

  function isValidType(type, data) {
    switch (type) {
      case 'string':
        if (typeof data !== 'string') {
          return false;
        }
        break;
      case 'boolean':
        if (typeof data !== 'boolean') {
          return false;
        }
        break;
      case 'integer':
      case 'number':
        if (typeof data !== 'number') {
          return false;
        }
        break;
      case 'array':
        if (typeof data !== 'object' || !(data instanceof Array)) {
          return false;
        }
        break;
      case 'object':
        if (typeof data !== 'object' || !(data instanceof Object)) {
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }

  /**
   * Validate type of a field.
   *
   * type could be a string or array of string.
   */
  const validateType = function (schema, data, path) {
    if (!schema.hasOwnProperty('type')) {
      return;
    }
    if (SWAGGER_SUPPORTED_TYPES.indexOf(schema.type) < 0) {
      throwError(UNKNOWN_REASON, 'Wrong swagger schema, trying to use unknown type ' + schema.type, path);
    }

    if (typeof schema.type === 'object' && (schema.type instanceof Array)) {
      for (let type of schema.type) {
        if (isValidType(type, data)) {
          return;
        }
      }
    } else {
      if (isValidType(schema.type, data)) {
        return;
      }
    }

    throwError(INVALID_TYPE, 'Incorrect type. Type should be ' + schema.type, path);
  };
  // expose this function outside
  this.validateType = validateType;

  /**
   * Get definition schema and return.
   */
  function loadDefinition (def) {
    const tokens = def.split('/');
    const definition = tokens[tokens.length-1];

    if (definitions.hasOwnProperty(definition)) {
      return definitions[definition];
    } else {
      return {};
    }
  }

  function _getDataLength (schema, data, multiple=1) {
    if (schema.type === 'integer' || schema.type === 'number') {
      return data * multiple;
    } else {
      return data.length;
    }
  }

  /**
   * Validate minimum length
   */
  function validateMinimum (schema, data, path) {
    if (schema.hasOwnProperty('minimum')) {
      if (schema.minimum > _getDataLength(schema, data)) {
        throwError(INVALID_MIN_LENGTH, 'The field needs to be equal to or bigger than ' + schema.minimum, path);
      }
    }
  }

  /**
   * Validate maximum length
   */
  function validateMaximum (schema, data, path) {
    if (schema.hasOwnProperty('maximum')) {
      if (schema.maximum < _getDataLength(schema, data)) {
        throwError(INVALID_MAX_LENGTH, 'The field needs to be equal to or smaller than ' + schema.maximum, path);
      }
    }
  }

  /**
   * Validate string pattern
   */
  function validatePattern (schema, data, path) {
    if (schema.hasOwnProperty('pattern') && schema.type === 'string') {
      if (!RegExp(schema.pattern).test(data)) {
        throwError(INVALID_STRING_PATTERN, 'The field needs to have a ' + schema.pattern + 'pattern.', path);
      }
    }
  }

  /**
   * Validate string pattern
   */
  function validateMulipleOf (schema, data, path) {
    if (schema.hasOwnProperty('multipleOf')) {
      if (schema.type === 'integer' && ((data % schema.multipleOf) !== 0)) {
        // TODO: this is tricky since it can be used with combination of min and max
        //      Also finding it in float gives incorrect result for (data % multipleOf )== 0.
        //      validate it integer for now
        throwError(INVALID_MULTIPLE_OF, 'The field should be multiple of ' + schema.multipleOf , path);
      }
    }
  }

  /**
   * Validate anyOf type
   *
   * TODO: Not embeded yet since swagger 2.0 does not support this.
   */
  function validateAnyOf(schema, data, path) {
    if (schema.hasOwnProperty('anyOf')) {
      // Swagger does not allow object enum and this logic is very specific to
      // our schema.
      let nothingMatched = true;
      let exceptions = [];
      for (let obj of schema.anyOf) {
        try {
          // slice is to clone path.
          validateSchema(obj, data, path.slice());
          nothingMatched = false;
          break;
        } catch (err) {
          exceptions.push(err);
        }
      }
      if (nothingMatched) {
        throwError(INVALID_ANY_OF, 'Tried object any of multiple but nothing matched.', path, exceptions); // eslint-disable-line
      }
    }
  }

  /**
   * Validate oneOf type
   *
   * TODO: Not embeded yet since swagger 2.0 does not support this.
   */
  function validateOneOf(schema, data, path) {
    if (schema.hasOwnProperty('oneOf')) {
      // Swagger does not allow object enum and this logic is very specific to
      // our schema.
      let matchedCount = 0;
      let exceptions = [];
      for (let obj of schema.oneOf) {
        try {
          // slice is to clone path.
          validateSchema(obj, data, path.slice());
          matchedCount+= 1;
        } catch (err) {
          exceptions.push(err);
        }
      }

      if (matchedCount === 0) {
        throwError(INVALID_ONE_OF, 'Tried object one of multiple objects but nothing matched.', path, exceptions); // eslint-disable-line
      }

      if (matchedCount !== 1) {
        throwError(INVALID_ONE_OF, 'Tried object one of multiple objects but many are matched.', path, exceptions); // eslint-disable-line
      }
    }
  }

  /**
   * Validate oneOf type
   *
   * TODO: Not embeded yet since swagger 2.0 does not support this.
   */
  function validateAllOf(schema, data, path) {
    if (schema.hasOwnProperty('allOf')) {
      // Swagger does not allow object enum and this logic is very specific to
      // our schema.
      let matchedCount = 0;
      let exceptions = [];
      for (let obj of schema.allOf) {
        try {
          // slice is to clone path.
          validateSchema(obj, data, path.slice());
          matchedCount+= 1;
        } catch (err) {
          exceptions.push(err);
        }
      }

      if (matchedCount === schema.allOf.length) {
        throwError(INVALID_ALL_OF, 'Tried object all of multiple objects but at least one didn\'t match.', path, exceptions); // eslint-disable-line
      }
    }
  }

  /**
   * Validate enum of data
   */
  function validateEnum(schema, data, path) {
    if (!schema.enum) {
      return;
    }
    let enumList = schema.enum;

    if (enumList.length > 0 && enumList[0] instanceof Object) {
      // Swagger does not allow object enum and this logic is very specific to
      // our schema.
      let nothingMatched = true;
      let exceptions = [];
      for (let obj of enumList) {
        try {
          // slice is to clone path.
          validateSchema(obj, data, path.slice());
          nothingMatched = false;
          break;
        } catch (err) {
          exceptions.push(err);
        }
      }
      if (nothingMatched) {
        throwError(INVALID_ANY_OF, 'Tried object any of multiple but nothing matched.', path, exceptions); // eslint-disable-line
      }
    } else {
      if (enumList.indexOf(data) < 0) {   // eslint-disable-line
        throwError(INVALID_ENUM_VALUE, data + ' is not in enum list.', path);
      }
    }
  }

  /**
   * Validate array
   *
   * TODO: validate additionalItems field
   */
  function validateArray(schema, data, path) {
    if (!schema.hasOwnProperty('items')) {
      throwError(INCORRECT_SCHEMA, 'Array Schema malformed.', path);
    }

    if (schema.items.hasOwnProperty('$ref')) {
      // This will mutate schema but its okay since
      // swagger allows only a homogenious type in array.
      schema.items = loadDefinition(schema.items['$ref']);
    }

    // validate minItems
    if (schema.hasOwnProperty('minItems')) {
      if (data.length < schema.minItems) {
        throwError(MIN_ITEM_NUMMER_NOT_MET, 'Array should be greater than ' + schema.minItems, path);
      }
    }

    if (schema.hasOwnProperty('maxItems')) {
      if (data.length > schema.maxItems) {
        throwError(MAX_ITEM_NUMMER_NOT_MET, 'Array should be less than ' + schema.maxItems, path);
      }
    }

    // validate each item
    data.forEach((data_item, index) => {
      path.push(index);
      validateSchema(schema.items, data_item, path);
      path.pop();
    });
  }

  /**
   * Validate Object
   *
   * TODO: support additionalProperties
   * TODO: support dependencies
   * TODO: support patternProperties
   * TODO: support minProperties and maxProperties
   */
  function validateObject(schema, data, path) {
    if (schema.hasOwnProperty('required')) {
      let required = schema.required;
      for (let item of required) {
        if (!data.hasOwnProperty(item)) {
          throwError(MISSING_REQUIRED_FIELD, 'Expect ' + item + ' to exist.', path);
        }
      }
    }

    for (let key in data) {
      if (schema.properties) {
        if (schema.properties.hasOwnProperty(key) && data.hasOwnProperty(key)) {
          path.push(key);
          validateSchema(schema.properties[key], data[key], path);
          path.pop();
        } else {
          // Being very strict on schema. This could be optional
          // but it is necessary to validate enum of objects for double
          // validations.
          throwError(INVALID_FIELD_EXISTS, 'contains ' + key + ' not specified in schema.', path);
        }
      }
    }
  }

  /**
   * Validate data against schema.
   */
  function validateSchema(schema, data, path=[]) {
    if (typeof schema !== 'object') {
      throwError(INCORRECT_SCHEMA, 'Schema malformed.', path);
    }

    if (schema.hasOwnProperty('anyOf')) {
      return validateAnyOf(schema, data, path);
    }

    if (schema.hasOwnProperty('allOf')) {
      return validateAllOf(schema, data, path);
    }

    if (schema.hasOwnProperty('oneOf')) {
      return validateOneOf(schema, data, path);
    }

    /* Here onward, schema is an object. */

    if (!schema.hasOwnProperty('type')) {
      if (schema.hasOwnProperty('$ref')) {
        // Try to load definition if it specifies $ref.
        schema = loadDefinition(schema['$ref']);
      } else {
        throwError(INCORRECT_SCHEMA, 'Schema malformed.', path);
      }
    }

    if (!schema.hasOwnProperty('type')) {
      throwError(INCORRECT_SCHEMA, 'Schema malformed.', path);
    }

    /* Here onward, schema has a type. */
    validateType(schema, data, path);

    validateMulipleOf(schema, data, path);

    validateMinimum(schema, data, path);

    validateMaximum(schema, data, path);

    validatePattern(schema, data, path);

    validateEnum(schema, data, path);

    if (schema.type === 'array') {
      validateArray(schema, data, path);
    } else if (schema.type === 'object') {
      validateObject(schema, data, path);
    }
  }
  return;
}

module.exports = { Validator };
