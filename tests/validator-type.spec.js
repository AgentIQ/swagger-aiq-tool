/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

const typeSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'integer'
    },
    married: {
      type: 'boolean'
    },
    info: {
      type: 'object',
      properties: {
        count: {
          type: 'integer'
        },
      }
    },
    children: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

const mockDefinitions = {
  Person: typeSchema
};


describe('Validator - enum field', () => {
  it('Should validate a integer type', (done) => {
      let v = new Validator(mockDefinitions);
      v.validate(typeSchema, { age: 35 })
        .then(() => {
          return v.validate(typeSchema, { age: '35' })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_TYPE');
              expect(err.results.path).toEqual(['age']);
              expect(err.results.reason).toEqual('Incorrect type. Type should be integer');
              done();
            });
        });
  });

  it('Should validate a string type.', (done) => {
      let v = new Validator(mockDefinitions);
      v.validate(typeSchema, { name: 'john' })
        .then(() => {
          return v.validate(typeSchema, { name: 12 })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_TYPE');
              expect(err.results.path).toEqual(['name']);
              expect(err.results.reason).toEqual('Incorrect type. Type should be string');
              done();
            });
        });
  });

  it('Should validate a boolean type.', (done) => {
      let v = new Validator(mockDefinitions);
      v.validate(typeSchema, { married: true })
        .then(() => {
          return v.validate(typeSchema, { married: 0 })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_TYPE');
              expect(err.results.path).toEqual(['married']);
              expect(err.results.reason).toEqual('Incorrect type. Type should be boolean');
              done();
            });
        });
  });

  it('Should validate a object type.', (done) => {
      let v = new Validator(mockDefinitions);
      v.validate(typeSchema, { info: { count: 10 } })
        .then(() => {
          return v.validate(typeSchema, { info: '10' })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_TYPE');
              expect(err.results.path).toEqual(['info']);
              expect(err.results.reason).toEqual('Incorrect type. Type should be object');
              done();
            });
        });
  });

  it('Should validate a array type.', (done) => {
      let v = new Validator(mockDefinitions);
      v.validate(typeSchema, { children: ['lovely'] })
        .then(() => {
          return v.validate(typeSchema, { children: [{ name: 'lovely' }] })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_TYPE');
              expect(err.results.path).toEqual(['children', 0]);
              expect(err.results.reason).toEqual('Incorrect type. Type should be string');
              done();
            });
        });
  });
});
