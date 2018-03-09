/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

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
}

describe('Validator - various type of definition references', () => {
  let v;
  beforeEach(() => {
    v = new Validator(definitions);
  });

  it('Validate simple definition', (done) => {
    let jsonData = { name: 'john', parent: { name: 'ted' } }
    v.validate(personSchema, jsonData)
      .then(() => {
        jsonData.parent.name = 23;
        return v.validate(personSchema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_TYPE');
            expect(err.results.path).toEqual(['parent', 'name']);
            expect(err.results.reason).toEqual('Incorrect type. Type should be string');
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
            expect(err.results.name).toEqual('INVALID_TYPE');
            expect(err.results.path).toEqual(['children', 1,'name']);
            expect(err.results.reason).toEqual('Incorrect type. Type should be string');
            done();
          });
      });
  });
});
