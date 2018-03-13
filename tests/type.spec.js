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
    },
    specialty: {
      type: ['integer', 'string']
    },
    extra: {
      type: 'object'
    }
  }
};

const mockDefinitions = {
  Person: typeSchema
};


describe('Validator - type checking', () => {
  let v;
  beforeEach(() => {
    v = new Validator(mockDefinitions);
  });

  it('Should validate a integer type', (done) => {
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

  it('Should validate a multi types.', (done) => {
    v.validate(typeSchema, { specialty: 100 })
      .then(() => {
        return v.validate(typeSchema, { specialty: '100' });
      })
      .then(() => {
        return v.validate(typeSchema, { specialty: [{ name: 'lovely' }] })
          .catch(err => {
            expect(err.results.name).toEqual('INVALID_TYPE');
            expect(err.results.path).toEqual(['specialty']);
            expect(err.results.reason).toEqual('Incorrect type. Type should be integer or string');
            done();
          });
      });
  });

  it('Should validate a empty object types.', (done) => {
    v.validate(typeSchema, { extra: {} })
      .then(() => {
        return v.validate(typeSchema, { extra: { test:1, wow: 'dummy' } });
      })
      .then(() => done());
  });
});
