const fs = require("fs");
const { sep } = require("path");

const isLeaf = testNode =>
  testNode.constructor === Object && Object.keys(testNode).length === 0;

const levelPropertiesToDirectories = (obj, filePath, executorObject = {}) => {
  const { leafProcedure, nonLeafProcedure, procedure } = executorObject;
  let { accumulator } = executorObject;
  let promiseArray = [];
  let fields = [];
  if (obj && obj instanceof Array) {
    obj.forEach(arrayObject => {
      promiseArray = promiseArray.concat(
        levelPropertiesToDirectories(arrayObject, filePath, {
          leafProcedure,
          nonLeafProcedure,
          procedure,
          accumulator
        })
      );
    });
  } else if (obj) {
    fields = Object.getOwnPropertyNames(obj);
  }
  fields.forEach(property => {
    const newPath = `${filePath}${sep}${property}`;
    try {
      fs.mkdirSync(newPath);
    } catch (e) {}
    if (obj[property] && Object.getOwnPropertyNames(obj[property]).length > 0) {
      if (nonLeafProcedure) {
        accumulator = nonLeafProcedure(newPath, accumulator, obj[property]);
      }
      if (procedure) {
        accumulator = procedure(newPath, accumulator, obj[property]);
      }
      promiseArray = promiseArray.concat(
        levelPropertiesToDirectories(obj[property], newPath, {
          leafProcedure,
          nonLeafProcedure,
          procedure,
          accumulator
        })
      );
    } else {
      if (leafProcedure && isLeaf(obj[property])) {
        accumulator = leafProcedure(newPath, accumulator, obj[property]);
      }
      if (procedure && isLeaf(obj[property])) {
        accumulator = procedure(newPath, accumulator, obj[property]);
      }
    }
  });
  return promiseArray;
};

exports.jsonToFsStructure = function(
  jsonObject,
  filePath = ".",
  cb = () => {}
) {
  return Promise.all(levelPropertiesToDirectories(jsonObject, filePath)).then(
    cb
  );
};

exports.jsonToFsWithLeafFunction = function(
  jsonObject,
  leafProcedure = () => {},
  context = {},
  filePath = ".",
  cb = () => {}
) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, {
      leafProcedure,
      accumulator: context
    })
  ).then(cb);
};

exports.jsonToFsWithNonLeafFunction = function(
  jsonObject,
  nonLeafProcedure = () => {},
  context = {},
  filePath = ".",
  cb = () => {}
) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, {
      nonLeafProcedure,
      accumulator: context
    })
  ).then(cb);
};

exports.jsonToFsWithFunction = function(
  jsonObject,
  procedure = () => {},
  context = {},
  filePath = ".",
  cb = () => {}
) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, {
      procedure,
      accumulator: context
    })
  ).then(cb);
};
