const fs = require("fs");
const {
  sep
} = require("path");

const isLeaf = testNode =>
  testNode.constructor === Object && Object.keys(testNode).length === 0;

const levelPropertiesToDirectories = (obj, filePath, stopWord, ignoredWords, spaceReplace, executorObject = {}) => {
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
        levelPropertiesToDirectories(arrayObject, filePath, stopWord, ignoredWords, spaceReplace, {
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
    if (property !== stopWord && ignoredWords.indexOf(property) === -1) {
      const newPath = spaceReplace ? `${filePath}${sep}${property.replace(/ /g, spaceReplace)}` : `${filePath}${sep}${property}`;
      let accumulatorCopy = Object.assign({}, accumulator)
      try {
        fs.mkdirSync(newPath);
      } catch (e) {}
      if (obj[`${property}`] && Object.keys(obj[`${property}`]).length > 0) {
        if (nonLeafProcedure) {
          accumulatorCopy = nonLeafProcedure(newPath, accumulator, obj[`${property}`], property);
        }
        if (procedure) {
          accumulatorCopy = procedure(newPath, accumulator, obj[`${property}`], property);
        }
        promiseArray = promiseArray.concat(
          levelPropertiesToDirectories(obj[`${property}`], newPath, stopWord, ignoredWords, spaceReplace, {
            leafProcedure,
            nonLeafProcedure,
            procedure,
            accumulator: accumulatorCopy
          })
        );
      } else {
        if (leafProcedure && isLeaf(obj[`${property}`])) {
          leafProcedure(newPath, Object.assign({}, accumulator), obj[`${property}`], property);
        }
        if (procedure && isLeaf(obj[`${property}`])) {
          procedure(newPath, Object.assign({}, accumulator), obj[`${property}`], property);
        }
      }
    } else if(ignoredWords.indexOf(property) === -1) {
      if (leafProcedure) {
        leafProcedure(`${filePath}${sep}`, Object.assign({}, accumulator), obj[`${property}`], property);
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
  spaceReplace,
  ignoredWords = []
}) {
  return Promise.all(levelPropertiesToDirectories(jsonObject, filePath, stopWord, ignoredWords, spaceReplace)).then(
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
  spaceReplace,
  ignoredWords = []
}) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, stopWord, ignoredWords, spaceReplace, {
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
  spaceReplace,
  ignoredWords = []
}) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, stopWord, ignoredWords, spaceReplace, {
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
  spaceReplace,
  ignoredWords = []
}) {
  return Promise.all(
    levelPropertiesToDirectories(jsonObject, filePath, stopWord, ignoredWords, spaceReplace, {
        procedure,
        accumulator: context
      })
  ).then(callback);
};
