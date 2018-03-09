'use strict';
const { throwError, error_type } = require('./error');
const {
  INVALID_FIELD_EXISTS,
  MISSING_REQUIRED_FIELD,
  INVALID_ENUM_VALUE,
  INVALID_TYPE,
  MIN_ITEM_NUMMER_NOT_MET,
  INCORRECT_SCHEMA,
  UNKNOWN_REASON
} = error_type;

// List of type support
const SWAGGER_SUPPORTED_TYPES = ['string', 'boolean', 'integer', 'number', 'object', 'array'];

/**
 * Schema validator.
 *
 * TODO: add min/max items validation.
 * TODO: add min/max length validation.
 * TODO: add multiple of validation.
 * TODO: add pattern validation.
 * TODO: add unique item validation.
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

  /**
   * Validate type of a field.
   */
  const validateType = function (type, data, path) {
    if (SWAGGER_SUPPORTED_TYPES.indexOf(type) < 0) {
      throwError(UNKNOWN_REASON, 'Wrong swagger schema, trying to use unknown type ' + type, path);
    }

    switch (type) {
      case 'string':
      case 'boolean':
        if (typeof data !== type) {
          throwError(INVALID_TYPE, 'Incorrect type. Type should be ' + type, path);
        }
        break;
      case 'integer':
      case 'number':
        if (typeof data !== 'number') {
          throwError(INVALID_TYPE, 'Incorrect type. Type should be ' + type, path);
        }
        break;
      case 'array':
        if (typeof data !== 'object' || !(data instanceof Array)) {
          throwError(INVALID_TYPE, 'Incorrect type. Type should be ' + type, path);
        }
        break;
      case 'object':
        if (typeof data !== 'object' || !(data instanceof Object)) {
          throwError(INVALID_TYPE, 'Incorrect type. Type should be ' + type, path);
        }
        break;
      default:
        break;
    }
  };
  // expose outside
  this.validateType = validateType;

  /**
   * Get definition schema and return.
   */
  function loadDefinition(def) {
    const tokens = def.split('/');
    const definition = tokens[tokens.length-1];

    if (definitions.hasOwnProperty(definition)) {
      return definitions[definition];
    } else {
      return {};
    }
  }

  /**
   * Validate enum of data
   */
  function validateEnum(enumList, data, path) {
    if (enumList.length > 0 && enumList[0] instanceof Object) {
      // Swagger does not allow object enum and this logic is very specific to
      // our schema.
      let nothingMatched = true;
      let exceptions = [];
      for (let enumObj of enumList) {
        try {
          // slice is to clone path.
          validateSchema(enumObj, data, path.slice());
          nothingMatched = false;
          break;
        } catch (err) {
          exceptions.push(err);
        }
      }
      if (nothingMatched) {
        throwError(INVALID_ENUM_VALUE, 'Tried object enum but nothing matched.', path, exceptions); // eslint-disable-line
      }
    } else {
      if (enumList.indexOf(data) < 0) {   // eslint-disable-line
        throwError(INVALID_ENUM_VALUE, data + ' is not in enum list.', path);
      }
    }
  }

  /**
   * Validate array
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

    // validate each item
    data.forEach((data_item, index) => {
      path.push(index);
      validateSchema(schema.items, data_item, path);
      path.pop();
    });
  }

  /**
   * Validate Object
   */
  function validateObject(schema, data, path) {
    // TODO(jaekwan): create validateObject() and factor out.
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
    // Exceptional case where field just contain type.
    if (typeof schema === 'string') {
      return validateType(schema, data, path);
    }

    if (typeof schema !== 'object') {
      throwError(INCORRECT_SCHEMA, 'Schema malformed.', path);
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

    validateType(schema.type, data, path);

    if (schema.enum) {
      validateEnum(schema.enum, data, path);
    }

    if (schema.type === 'array') {
      validateArray(schema, data, path);
    } else if (schema.type === 'object') {
      validateObject(schema, data, path);
    }
  }
  return;
}

module.exports = { Validator };
