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
And (as it's currently intended to be used on the server) usage looks like this on a simple node server:
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

# Executing functions in place
Suppose you want to execute a function for each directory whether it be a terminating (leaf) directory or another directory.  The function format is as follows:
```javascript
const procedure = (newPath, accumulator, obj) => {
  // something that takes the just created directory (relative newPath)
  // and the accumulator (a structure you can provide that continues through each call)
  // and the obj, the value of the nested structure if this is a leaf node it's {}

  // lastly we return the accumulator to persist it
  return accumulator;
}
```
The corresponding functions for the above executing procedures are: `jsonToFsWithLeafFunction`, `jsonToFsWithNonLeafFunction` and `jsonToFsWithFunction`.  So an example usage in a simple express server would look like this:
```javascript
var express = require('express');
var { jsonToFsWithLeafFunction } = require('json-to-fs-structure');
var app = express();

const procedure = (newPath, accumulator, obj) => {
  accumulator.contextvalue += 2;
  accumulator.paths.push(newPath);
  return accumulator;
};

app.get('/', function(req, res){
  let passByValueContext = {"contextvalue": 1, paths: []};
   jsonToFsWithLeafFunction(
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
     }, procedure, passByValueContext);
     console.log(passByValueContext);
   res.send("Hello world!");
});

app.listen(3000);
```
What we expect to see in the console when this runs is:
```javascript
{ contextvalue: 9,
  paths:
   [ './testArrayField5/somedir',
     './testArrayField5/anotherdir',
     './testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour',
     './testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive' ] }
```
And since our context value is scoped to each request, you will see that for every GET method.
