/* eslint-env jasmine */

const definitions = require('./samples/swagger').definitions;
const Validator = require('../libs/validator').Validator;
const dialogs = require('./data/examples/dialogs');
const messages = require('./data/examples/messages');
const workflows = require('./data/examples/workflows');
const entities = require('./data/examples/entities');
const intents = require('./data/examples/intents');
// TODO: add commands
//const commands = require('./data/examples/commands');

describe('Validator - validate examples', () => {
  it('Validate a general simple object', (done) => {
    const test_data = [[
      {
        'type': 'object',
        'required': [
          'name'
        ],
        'properties': {
          'id': {
            'type': 'integer',
            'format': 'int64'
          },
          'name': {
            'type': 'string',
            'enum': [
              'conversations.messages.create',
              'actions.run',
              'bot.pass',
              'database.query'
            ]
          }
        }
      },
      {
        'id': 323,
        'name': 'bot.pass'
      }
    ]];

    let v = new Validator(definitions);
    for (let test_set of test_data) {
      v.validate(test_set[0], test_set[1])
        .then(() => done());
    }
  });

  it('Validate dialog objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of dialogs.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Dialog' }, test_set));
    }
    Promise.all(promises).then(() => done());
  });

  it('Validate message objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of messages.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Message' }, test_set));
    }
    Promise.all(promises).then(() => done());
  });

  it('Validate workflow objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of workflows.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Message' }, test_set));
    }
    Promise.all(promises).then(() => done());
  });

  it('Validate intent objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of intents.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Intent' }, test_set));
    }
    Promise.all(promises).then(() => done());
  });

  it('Validate a definition refered entity object', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of entities.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Entity' }, test_set));
    }
    Promise.all(promises).then(() => done());
  });


});
