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
