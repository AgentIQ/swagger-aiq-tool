Swagger AIQ Tool
=========================

Swagger AIQ Tool supports a express middleware and swagger validator. 


Using inside project
========================
Add package
-----------
```
npm install -save swagger-aiq-tool // TODO: add to npm registry.
```
Middleware Usage
-----------
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
If you want to use validator seperately, it is available in the tool.
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
