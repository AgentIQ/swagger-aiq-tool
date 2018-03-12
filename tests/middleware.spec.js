/* eslint-env jasmine */

const middleware = require('../libs/middleware');
const { compareNamePathReason, makeRequest }= require('./helper');

const SwaggerDoc = {
  paths: {
    '/': {
    },
    '/actions': {
        'get': {
          parameters: [
              {
                name: 'q',
                description: 'free text search',
                in: 'query',
                required: false,
                type: 'string'
              },
              {
                name: 'limit',
                in: 'query',
                required: false,
                type: 'integer'
              }
          ]
        }
    },
    '/actions/{id}': {
        put: {
          parameters: [
              {
                name: 'actions',
                in: 'body',
                required: true,
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: {
                      type: 'integer'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              }
          ]
        }
    },
    '/actions/{id}/name': {
        post: {
          parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                type: 'integer'
              },
              {
                name: 'actions',
                in: 'body',
                required: true,
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                        type: 'string'
                    }
                  }
                }
              }
          ]
        }
    },
  }
};

describe('Express Middleware', () => {
  let m;
  beforeEach(() => {
    m = middleware.createMiddleWare(SwaggerDoc);
  });

  describe('Middleware - testing path', () => {
    it('Should leave if unknown request type is requested.', (done) => {
        let req = makeRequest('/', 'get', { test: 1 });
        m(req, null, function(err) {
          expect(err).toEqual(undefined);
          done();
        });
    });

    it('Should validate path variable.', (done) => {
        let req = makeRequest('/actions/123', 'put', { name: 'test' });
        m(req, null, function(err) {
          compareNamePathReason(
            err,
            'MISSING_REQUIRED_FIELD',
            [],
            'Expect id to exist.');
          done();
        });
    });

    it('Should validate params.', (done) => {
        let req = makeRequest('/actions/txt/name', 'post', { name: 'test' });
        m(req, null, function(err) {
          compareNamePathReason(
            err,
            'INVALID_PATH_TYPE',
            ['paths'],
            'Incorrect type. Type should be integer');
          done();
        });
    });
  });

  describe('Middleware - testing params', () => {
    it('Should not validate if params are not given.', (done) => {
        let req = makeRequest('/actions', 'get', {});
        m(req, null, function(err) {
          expect(err).toEqual(undefined);
          done();
        });
    });

    it('Should validate integer and string params.', (done) => {
        let req = makeRequest('/actions?q=cancel&limit=123', 'get', {});
        m(req, null, function(err) {
          expect(err).toEqual(undefined);
          done();
        });
    });

    it('Should detect wrong integer params.', (done) => {
        let req = makeRequest('/actions?q=cancel&limit=weoi', 'get', {});
        m(req, null, function(err) {
          compareNamePathReason(
            err,
            'INVALID_PARAMS',
            ['parameters'],
            'Incorrect type. Type should be integer');
          done();
        });
    });

    it('Should detect wrong string params.', (done) => {
        let req = makeRequest('/actions?q=23234&limit=234', 'get', {});
        m(req, null, function(err) {
          compareNamePathReason(
            err,
            'INVALID_PARAMS',
            ['parameters'],
            'Incorrect type. Type should be string');
          done();
        });
    });
  });
});
