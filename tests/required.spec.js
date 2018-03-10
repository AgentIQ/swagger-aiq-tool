/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

const nameRequiredSchema = {
  type: 'object',
  required: [
    'name'
  ],
  properties: {
    name: {
      type: 'string'
    },
    info: {
      type: 'object',
      required: [
        'id'
      ],
      properties: {
        id: {
          type: 'integer'
        },
        extra: {
          type: 'string'
        }
      }
    }
  }
};

const mockDefinitions = {
  Customer1: nameRequiredSchema
};

describe('Validator - required field', () => {
  let v;
  beforeEach(() => {
    v = new Validator(mockDefinitions);
  });

  it('Should validate a simple required field', (done) => {
    v.validate(nameRequiredSchema, { name: 'james' })
      .then(() => {
        return v.validate(nameRequiredSchema, { first_name: 'james' })
          .catch(err => {
            expect(err.results.name).toEqual('MISSING_REQUIRED_FIELD');
            expect(err.results.path).toEqual([]);
            expect(err.results.reason).toEqual('Expect name to exist.');
            done();
          });
      });
  });

  it('Should validatea nested required field', (done) => {
    v.validate(nameRequiredSchema, { name: 'james', info: { id:123 } })
      .then(() => {
        return v.validate(nameRequiredSchema, { name: 'james', info: { _id:123 } })
          .catch(err => {
            expect(err.results.name).toEqual('MISSING_REQUIRED_FIELD');
            expect(err.results.path).toEqual(['info']);
            expect(err.results.reason).toEqual('Expect id to exist.');
            done();
          });
      });
  });
});
