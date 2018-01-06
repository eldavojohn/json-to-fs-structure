const fs = require("fs");
const { sep } = require("path");

const levelPropertiesToDirectories = (obj, filePath) => {
  let promiseArray = [];
  let fields = [];
  if (obj && obj instanceof Array) {
    obj.forEach(arrayObject => {
      promiseArray = promiseArray.concat(
        levelPropertiesToDirectories(arrayObject, filePath)
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
      promiseArray = promiseArray.concat(
        levelPropertiesToDirectories(obj[property], newPath)
      );
    }
  });
  return promiseArray;
};

exports.jsonToFsStructure = function(jsonObject, filePath = ".", cb) {
  return Promise.all(levelPropertiesToDirectories(jsonObject, filePath)).then(
    cb
  );
};
