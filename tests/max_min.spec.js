/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minimum: 2,
      maximum: 10,
    },
    age: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
    },
    score: {
      type: 'number',
      minimum: 50.0,
      maximum: 100.0,
    },
    family: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
      maxItems: 5
    }
  }
};

describe('Validator - maximum, minimum, maxItems, and minItems', () => {
  let v;
  let jsonData;
  beforeEach(() => {
    v = new Validator();
    jsonData = {
      name: 'john',
      age: 27,
      score: 55.9,
      family: ['amy', 'mike']
    };
  });

  it('Should pass valid min/max values', (done) => {
    v.validate(schema, jsonData)
      .then(() => done());
  });

  it('Should throw min/max value in string', (done) => {
    jsonData.name = 'a';
    v.validate(schema, jsonData)
      .catch(err => {
        expect(err.results.name).toEqual('INVALID_MIN_LENGTH');
        expect(err.results.path).toEqual(['name']);
        expect(err.results.reason).toEqual('The field needs to be equal to or bigger than 2');

        jsonData.name = 'agentiq agentiq agentiq';

        v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_MAX_LENGTH');
            expect(err.results.path).toEqual(['name']);
            expect(err.results.reason).toEqual('The field needs to be equal to or smaller than 10');
            done();
          });
      });
  });

  it('Should throw min/max value in number', (done) => {
    jsonData.score = 10.1;
    v.validate(schema, jsonData)
      .catch(err => {
        expect(err.results.name).toEqual('INVALID_MIN_LENGTH');
        expect(err.results.path).toEqual(['score']);
        expect(err.results.reason).toEqual('The field needs to be equal to or bigger than 50');

        jsonData.score = 1000.1;

        v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_MAX_LENGTH');
            expect(err.results.path).toEqual(['score']);
            expect(err.results.reason).toEqual('The field needs to be equal to or smaller than 100');
            done();
          });
      });
  });

  it('Should throw min/max value in integer', (done) => {
    jsonData.age = -1;
    v.validate(schema, jsonData)
      .catch(err => {
        expect(err.results.name).toEqual('INVALID_MIN_LENGTH');
        expect(err.results.path).toEqual(['age']);
        expect(err.results.reason).toEqual('The field needs to be equal to or bigger than 1');

        jsonData.age = 101;

        v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_MAX_LENGTH');
            expect(err.results.path).toEqual(['age']);
            expect(err.results.reason).toEqual('The field needs to be equal to or smaller than 100');
            done();
          });
      });
  });

  it('Should throw minItems/maxItems in array', (done) => {
    jsonData.family = [];
    v.validate(schema, jsonData)
      .catch(err => {
        expect(err.results.name).toEqual('MIN_ITEM_NUMMER_NOT_MET');
        expect(err.results.path).toEqual(['family']);
        expect(err.results.reason).toEqual('Array should be greater than 1');

        jsonData.family = ['a', 'b', 'c', 'd', 't', 's'];

        v.validate(schema, jsonData)
          .catch(err => {
            expect(err.results.name).toEqual('MAX_ITEM_NUMMER_NOT_MET');
            expect(err.results.path).toEqual(['family']);
            expect(err.results.reason).toEqual('Array should be less than 5');
            done();
          });
      });
  });
});
