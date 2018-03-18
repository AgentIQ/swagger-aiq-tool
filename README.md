Swagger AIQ Tool
=========================

Swagger AIQ Tool supports a express middleware and swagger validator. The middleware is compatible with swagger 2.0 and json schema that swagger 2.0 supports. This is specially made to support followings.

- Circular definitions that a definition refer to another definition and it refers back to its parent definition.
- Using enum with object. (It is equivalant to onoOf field in swagger 3.0 but not swagger 2.0)

Using inside project
========================
Add package
-----------
```
// TODO: the package is currently stored in private registry. maybe make it public.
npm install -save @agentiq/swagger-aiq-tool 
```
Middleware Usage
-----------
The middleware is compatible with expressjs for now.
```
const express = require('express');
const schema = require('./path/to/schema');
const tool = require('swagger-aiq-tool');

const app = express();

// expect schema to be js object
app.use(tool.createMiddleware(schema));
```
Validator
-----------
The validator is a independent object and it can be used seperately as a component. It has an option variable for definitions.
```
const Validator = require('swagger-aiq-tool').Validator;

const myValidator = new Validator();
myValidator.validate(jsonSchema, jsonData)
  .then(() => console.log('Success');
  .catch(err => console.log('Failed');
```


Development
=========================
Install Dependencies
-------
```
npm install
```

Test
-------
```
npm test
```

Lint
-------
```
npm run lint
```
