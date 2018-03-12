'use strict';

const compareNamePathReason = function (err, name, path, reason) {
  expect(err.results.name).toEqual(name);
  expect(err.results.path).toEqual(path);
  expect(err.results.reason).toEqual(reason);
};

const makeRequest = function (path, type, body) {
  let tokens = path.split('?');
  let params = {};

  if (tokens.length > 1) {
    let keyValues = tokens[1].split('&');
    for (let keyVal of keyValues) {
      let [key, val] = keyVal.split('=');
      if (key && val) {
        params[key] = isNaN(val) ? val : parseInt(val);
      }
    }
  }

  return {
    url: tokens[0],
    method: type,
    body: body,
    params: params
  };
};

module.exports = { compareNamePathReason, makeRequest };
