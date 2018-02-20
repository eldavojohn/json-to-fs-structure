const fs = require("fs");
const {
  sep
} = require("path");

const isLeaf = testNode =>
  testNode.constructor === Object && Object.keys(testNode).length === 0;

const levelPropertiesToDirectories = (obj, filePath, stopWord, spaceReplace, executorObject = {}) => {
  if (obj && (typeof obj === 'string' || obj instanceof String)) {
    return;
  }
  const {
    leafProcedure,
    nonLeafProcedure,
    procedure
  } = executorObject;
  let {
    accumulator
  } = executorObject;
  let promiseArray = [];
  let fields = [];
  if (obj && obj instanceof Array) {
    obj.forEach(arrayObject => {
      promiseArray = promiseArray.concat(
        levelPropertiesToDirectories(arrayObject, filePath, stopWord, spaceReplace, {
          leafProcedure,
          nonLeafProcedure,
          procedure,
          accumulator
        })
      );
    });
  } else if (obj) {
    fields = Object.keys(obj) || [];
  }
  fields.forEach(property => {
    if (property !== stopWord) {
      const newPath = spaceReplace ? `${filePath}${sep}${property.replace(/ /g, spaceReplace)}` : `${filePath}${sep}${property}`;
      try {
        fs.mkdirSync(newPath);
      } catch (e) {}
      if (obj[`${property}`] && Object.keys(obj[`${property}`]).length > 0) {
        if (nonLeafProcedure) {
          accumulator = nonLeafProcedure(newPath, accumulator, obj[`${property}`]);
        }
        if (procedure) {
          accumulator = procedure(newPath, accumulator, obj[`${property}`]);
        }
        promiseArray = promiseArray.concat(
          levelPropertiesToDirectories(obj[`${property}`], newPath, stopWord, spaceReplace, {
            leafProcedure,
            nonLeafProcedure,
            procedure,
            accumulator
          })
        );
      } else {
        if (leafProcedure && isLeaf(obj[`${property}`])) {
          accumulator = leafProcedure(newPath, accumulator, obj[`${property}`]);
        }
        if (procedure && isLeaf(obj[`${property}`])) {
          accumulator = procedure(newPath, accumulator, obj[`${property}`]);
        }
      }
    } else {
      if (leafProcedure) {
        accumulator = leafProcedure(`${filePath}${sep}`, accumulator, obj[`${property}`]);
      }
    }
  });
  return promiseArray;
};

exports.jsonToFsStructure = function({
  jsonObject,
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace
}) {
  return Promise.all(levelPropertiesToDirectories(jsonObject, filePath, stopWord, spaceReplace)).then(
    callback
  );
};

exports.jsonToFsWithLeafFunction = function({
  jsonObject,
  leafProcedure = () => {},
  context = {},
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace
}) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, stopWord, spaceReplace, {
        leafProcedure,
        accumulator: context
      })
  ).then(callback);
};

exports.jsonToFsWithNonLeafFunction = function({
  jsonObject,
  nonLeafProcedure = () => {},
  context = {},
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace
}) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, stopWord, spaceReplace, {
        nonLeafProcedure,
        accumulator: context
      })
  ).then(callback);
};

exports.jsonToFsWithFunction = function({
  jsonObject,
  procedure = () => {},
  context = {},
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace
}) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, stopWord, spaceReplace, {
        procedure,
        accumulator: context
      })
  ).then(callback);
};
