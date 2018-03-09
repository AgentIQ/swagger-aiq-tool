/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    address: {
      type: 'object',
      properties: {
        unit: { type: 'integer' },
        street: { type: 'string' },
        pin: { type: 'integer' },
        state: { type: 'string' }
      }
    },
    account: {
      type: 'integer'
    }
  }
};

describe('Validator - unexpected field', () => {
  let v;
  beforeEach(() => {
    v = new Validator();
  });

  it('Should identify existence of unexpected fields', (done) => {
    let jsonData = {
      name: 'james',
      account: 123123,
      address: {
        unit: 301,
        street: 'Park ave',
        state: 'CA',
        pin: 93458
      }
    };

    v.validate(schema, jsonData)
      .then(() => {
        // Add unexpect field
        jsonData.address.floor = '3 floor';
        return v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_FIELD_EXISTS');
            expect(err.results.path).toEqual(['address']);
            expect(err.results.reason).toEqual('contains floor not specified in schema.');
            done();
          });
      });
  });
});
