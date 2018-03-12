/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      pattern: '^[a-z_]+$'
    },
    account: {
      type: 'string',
      pattern: '^G\\d{5}$'
    },
    info: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          pattern: '^\\d{3}-\\d{3}-\\d{4}$'
        }
      }
    }
  }
};

describe('Validator - Using regex', () => {
  let v;
  beforeEach(() => {
    v = new Validator();
  });

  it('Validate a simple pattern definition', (done) => {
    let jsonData = { name: 'customer_cetner', account: 'G48586' };
    v.validate(schema, jsonData)
      .then(() => {
        jsonData.name = 'Customer_center';
        return v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_STRING_PATTERN');
            expect(err.results.path).toEqual(['name']);
            expect(err.results.reason).toEqual('The field needs to have a ^[a-z_]+$ pattern.');
            done();
          });
      });
  });

  it('Validate a nested object that has a pattern definition', (done) => {
    let jsonData = { name: 'customer_cetner', account: 'G48586', info: { phone: '233-324-5464' } };
    v.validate(schema, jsonData)
      .then(() => {
        jsonData.info.phone = '2342349999';
        return v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_STRING_PATTERN');
            expect(err.results.path).toEqual(['info', 'phone']);
            expect(err.results.reason).toEqual('The field needs to have a ^\\d{3}-\\d{3}-\\d{4}$ pattern.');
            done();
          });
      });
  });
});
