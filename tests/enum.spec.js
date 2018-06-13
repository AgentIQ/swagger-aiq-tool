/* eslint-env jasmine */

const Validator = require('../libs/validator').Validator;

const enumSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      enum: ['test1', 'test2', 'test3']
    },
    age: {
      type: 'integer',
      enum: [11, 22, 33, 44, 55]
    },
    info: {
      type: 'object',
      properties: {
        count: {
          type: 'integer',
          enum: [10, 20, 30]
        },
        category: {
          type: 'string',
          enum: ['electronics', 'food', 'medicine']
        }
      }
    },
    generic_field: {
      type: 'object',
      enum: [
        {
          '$ref': '#/definitions/Electronic'
        },
        {
          '$ref': '#/definitions/Cloth'
        }
      ]
    }
  }
};

const electronicSchema = {
  type: 'object',
  properties: {
    voltage: {
      type: 'string',
      enum: ['110v', '100v', '200v', '220v']
    }
  }
};

const clothSchema = {
  type: 'object',
  properties: {
    size: {
      type: 'string',
      enum: ['s', 'm', 'l']
    },
    length: {
      type: 'integer'
    }
  }
};

const mockDefinitions = {
  Product: enumSchema,
  Electronic: electronicSchema,
  Cloth: clothSchema,
};


describe('Validator - enum field', () => {
  let v;
  beforeEach(() => {
    v = new Validator(mockDefinitions);
  });

  it('Should validate a string enum field', (done) => {
      v.validate(enumSchema, { name: 'test1' })
        .then(() => {
          return v.validate(enumSchema, { name: 'test10' })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_ENUM_VALUE');
              expect(err.results.path).toEqual(['name']);
              expect(err.results.reason).toEqual('test10 is not in enum list.');
              done();
            });
        });
  });

  it('Should validate a nested string enum field', (done) => {
      v.validate(enumSchema, { info: { category: 'food' } })
        .then(() => {
          return v.validate(enumSchema, { info: { category: 'foody' } })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_ENUM_VALUE');
              expect(err.results.path).toEqual(['info', 'category']);
              expect(err.results.reason).toEqual('foody is not in enum list.');
              done();
            });
        });
  });

  it('Should validate a integer enum field', (done) => {
      v.validate(enumSchema, { age: 33 })
        .then(() => {
          return v.validate(enumSchema, { age: 34 })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_ENUM_VALUE');
              expect(err.results.path).toEqual(['age']);
              expect(err.results.reason).toEqual('34 is not in enum list.');
              done();
            });
        });
  });

  it('Should validate a nested integer enum field', (done) => {
      v.validate(enumSchema, { info: { count: 10 } })
        .then(() => {
          return v.validate(enumSchema, { info: { count: 100 } })
            .catch(err => {
              expect(err.results.name).toEqual('INVALID_ENUM_VALUE');
              expect(err.results.path).toEqual(['info', 'count']);
              expect(err.results.reason).toEqual('100 is not in enum list.');
              done();
            });
        });
  });

  it('Should validate a object enum field', (done) => {
      v.validate(enumSchema, { generic_field: { voltage: '110v' } })
        .then(() => {
          return v.validate(enumSchema, { generic_field: { size: 'm' } });
        })
        .then(() => {
          return v.validate(enumSchema, { generic_field: { test: 1234 } });
        })
        .catch(err => {
          expect(err.results.name).toEqual('INVALID_ENUM_VALUE');
          expect(err.results.path).toEqual(['generic_field']);
          expect(err.results.reason).toEqual('Tried object any of multiple but nothing matched.');
          done();
        });
  });
});
