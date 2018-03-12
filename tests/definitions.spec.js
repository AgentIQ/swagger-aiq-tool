/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;
const { compareNamePathReason }= require('./helper');

const personSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    parent: {
      '$ref': '#definition/Person'
    },
    children: {
      type: 'array',
      items: {
        '$ref': '#definition/Person'
      }
    }
  }
};

const definitions = {
  Person: personSchema
};

describe('Validator - various type of definition references', () => {
  let v;
  beforeEach(() => {
    v = new Validator(definitions);
  });

  it('Validate simple definition', (done) => {
    let jsonData = { name: 'john', parent: { name: 'ted' } };
    v.validate(personSchema, jsonData)
      .then(() => {
        jsonData.parent.name = 23;
        return v.validate(personSchema, jsonData)
          .catch(err => {
            compareNamePathReason(err,
              'INVALID_TYPE',
              ['parent', 'name'],
              'Incorrect type. Type should be string');
            done();
          });
      });
  });

  it('Validate a nested object definition', (done) => {
    let jsonData = {
      name: 'john',
      parent: {
        name: 'ted',
        parent: {
          name: 'mike'
        }
      }
    };
    v.validate(personSchema, jsonData)
      .then(() => {
        jsonData.parent.parent.name = 23;
        return v.validate(personSchema, jsonData)
          .catch(err => {
            compareNamePathReason(err,
              'INVALID_TYPE',
              ['parent', 'parent', 'name'],
              'Incorrect type. Type should be string');
            done();
          });
      });
  });

  it('Validate definition in array', (done) => {
    let jsonData = {
      name: 'john',
      children: [
        { name: 'joe' },
        { name: 'sam' }
      ]
    };
    v.validate(personSchema, jsonData)
      .then(() => {
        jsonData.children[1].name = 23;
        return v.validate(personSchema, jsonData)
          .catch(err => {
            compareNamePathReason(err,
              'INVALID_TYPE',
              ['children', 1, 'name'],
              'Incorrect type. Type should be string');
            done();
          });
      });
  });

  it('Validate definition in nested array', (done) => {
    let jsonData = {
      name: 'john',
      children: [
        { name: 'joe',
          children: [{ name: 'cho' }]
        },
        { name: 'sam',
          children: [{ name: 'kay' }]
        }
      ]
    };
    v.validate(personSchema, jsonData)
      .then(() => {
        jsonData.children[1].children[0].name = 20;
        return v.validate(personSchema, jsonData)
          .catch(err => {
            compareNamePathReason(err,
              'INVALID_TYPE',
              ['children', 1, 'children', 0, 'name'],
              'Incorrect type. Type should be string');
            done();
          });
      });
  });
});
