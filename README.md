# json-to-fs-structure
Clean and simple JavaScript project for turning JSON objects into directory structures.

# Development
For development, clone into this repository and to install run:
`yarn install`
To test run:
`yarn test`

# Usage
To use this node module, install it like so:
`yarn add json-to-fs-structure`
And (as it's currently intended to be used on the server) usage looks like:
```javascript
var express = require('express');
var { jsonToFsStructure } = require('json-to-fs-structure');
var app = express();

app.get('/', function(req, res){
   jsonToFsStructure(
     {
       testArrayField5: [
         { somedir: {} },
         { anotherdir: {} },
         {
           andanotherdir: {
             interiorone: {
               interiortwo: {
                 interiorthree: [{ interiorfour: {} }, { interiorfive: {} }]
               }
             }
           }
         }
       ]
     });
   res.send("Hello world!");
});

app.listen(3000);

```
Or if you want to see how it works synchronously (server only returns after it is written to the root directory), your code would look more like this:
```javascript
var express = require('express');
var { jsonToFsStructure } = require('json-to-fs-structure');
var app = express();

app.get('/', function(req, res){
   jsonToFsStructure(
     {
       testArrayField5: [
         { somedir: {} },
         { anotherdir: {} },
         {
           andanotherdir: {
             interiorone: {
               interiortwo: {
                 interiorthree: [{ interiorfour: {} }, { interiorfive: {} }]
               }
             }
           }
         }
       ]
     }, ".", () => res.send("Hello world!"));
});

app.listen(3000);
```

Both of those examples would leave you with directory trees that look like this:
![directory example of json to fs](documentation/sample-result.png?raw=true "directory example of json to fs")
