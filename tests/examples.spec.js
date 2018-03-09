/* eslint-env jasmine */

const definitions = require('./samples/swagger').definitions;
const Validator = require('../libs/validator').Validator;
const dialogs = require('./data/examples/dialogs');
const messages = require('./data/examples/messages');
const commands = require('./data/examples/commands');
const workflows = require('./data/examples/workflows');
const entities = require('./data/examples/entities');
const intents = require('./data/examples/intents');

describe('Validator - validate examples', () => {
  it('Validate simple object', (done) => {
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
    Promise.all(promises).then(() => done())
  });

  it('Validate message objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of messages.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Message' }, test_set));
    }
    Promise.all(promises).then(() => done())
  });

  it('Validate workflow objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of workflows.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Message' }, test_set));
    }
    Promise.all(promises).then(() => done())
  });

  it('Validate intent objects using definition', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of intents.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Intent' }, test_set));
    }
    Promise.all(promises).then(() => done())
  });

  it('Validate a definition refered entity object', (done) => {
    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of entities.data) {
      promises.push(v.validate({ '$ref': '#/definitions/Entity' }, test_set));
    }
    Promise.all(promises).then(() => done())
  });

  it('Validate a recursive object', (done) => {
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
        },
        'payload': {
          '$ref': '#/definitions/ActionPayload'
        }
      }
    },
    {
      'id': 123,
      'name': 'conversations.messages.create',
      'payload': {
        'message': {
          'payload': {
            'message_type': 'replies',
            'replies': {
              'attachments': [
              {
                'message_type': 'reply',
                'reply': {
                  'content': 'yes',
                  'postback': {
                    'payload': '{ }'
                  }
                }
              },
              {
                'message_type': 'reply',
                'reply': {
                  'content': 'no',
                  'postback': {
                    'payload': '{ }'
                  }
                }
              }
              ]
            }
          }
        }
      }
    }]];

    let v = new Validator(definitions);
    for (let test_set of test_data) {
      v.validate(test_set[0], test_set[1])
        .then(() => done());
    }
  });

  it('Validate detect type error', (done) => {
    const test_data = [[
      {
        '$ref': '#/definitions/Dialog'
      },
      {
        'id': 21,
        'name': 'check_coupon_validity',
        'payload': {
          'entity': '',
          'prompt': 'Is your coupon valid today?',
          'list_type': {
            'response_values': [
            { 'value': 'Yes, it is valid.',
              'actions': [
              {
                'id': '123',  // WRONG ID
                'name': 'conversations.messages.create',
                'unit_type': 'action',
                'payload': {
                  'message': {
                    'payload': {
                      'content': 'Great here are some suggestion on using it.'
                    }
                  },
                  'forked': true
                }
              }
              ]
            }
            ]
          },
          'dialog_type': 'list_type'
        }
      }
    ],
    [
      {
        '$ref': '#/definitions/Dialog'
      },
      {
        'id': 21,
        'name': 'check_coupon_validity',
        'payload': {
          'entity': '',
          'prompt': 'Is your coupon valid today?',
          'list_type': {
            'response_values': [
            { 'value': 'Yes, it is valid.',
              'actions': [
              {
                'id': 1217,
                'name': 'conversations.messages.create',
                'unit_type': 'workflw',   // WRONG ENUM
                'payload': {
                  'message': {
                    'payload': {
                      'content': 'Great here are some suggestion on using it.'
                    }
                  },
                  'forked': true
                }
              }
              ]
            }
            ]
          },
          'dialog_type': 'list_type'
        }
      }
    ],
    [
      {
        '$ref': '#/definitions/Dialog'
      },
      {
        'id': 21,
        'name': 'check_coupon_validity',
        'payload': {
          'entity': '',
          'prompt': 'Is your coupon valid today?',
          'list_type': {
            'response_values': [
              { 'value': 'Yes, it is valid.',
                'actions': [
                {
                  'id': 1217,
                  'name': 'conversations.messages.create',
                  'unit_type': 'action',
                  'payload': {
                    'message': {
                      'payload': {
                        'content': 'Great here are some suggestion on using it.'
                      }
                    },
                    'forked': true,
                    'new_field': 'unknown field'
                  }
                }
                ]
              }
            ]
          },
          'dialog_type': 'list_type'
        }
      }
    ]];

    let v = new Validator(definitions);
    let promises = [];
    for (let test_set of test_data) {
      promises.push(v.validate(test_set[0], test_set[1]));
    }
    Promise.all(promises)
      .then(() => {})
      .catch(() => done());   // TODO(jaekwan): check actual error results
  });
});
