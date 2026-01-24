const assert = require("assert");
const fs = require("fs");

const {
  jsonToFsStructure,
  jsonToFsWithLeafFunction,
  jsonToFsWithNonLeafFunction,
  jsonToFsWithFunction,
} = require("../index");

describe("json-to-fs-structure", () => {
  describe("jsonToFsStructure", () => {
    it("should produce a simple directory with a first layer object", (done) => {
      const options = {
        jsonObject: {
          testDirectoryField: {},
        },
        filePath: ".",
        callback: () => {
          assert.equal(fs.statSync("testDirectoryField").size, 4096);
          fs.rmdirSync("testDirectoryField");
          done();
        },
      };
      jsonToFsStructure(options);
    });
    it("should produce a simple directory with a first layer object with siblings", (done) => {
      const options = {
        jsonObject: {
          testDirectoryField0: {},
          testDirectoryField1: {},
          testDirectoryField2: {},
        },
        filePath: ".",
        callback: () => {
          assert.equal(fs.statSync("testDirectoryField0").size, 4096);
          assert.equal(fs.statSync("testDirectoryField1").size, 4096);
          assert.equal(fs.statSync("testDirectoryField2").size, 4096);
          fs.rmdirSync("testDirectoryField0");
          fs.rmdirSync("testDirectoryField1");
          fs.rmdirSync("testDirectoryField2");
          done();
        },
      };
      jsonToFsStructure(options);
    });
    it("should produce a nested directory structure", (done) => {
      const options = {
        jsonObject: {
          testDirectoryField3: { innerTestField: {} },
        },
        filePath: ".",
        callback: () => {
          assert.equal(
            fs.statSync("testDirectoryField3/innerTestField").size,
            4096,
          );
          fs.rmdirSync("testDirectoryField3/innerTestField");
          fs.rmdirSync("testDirectoryField3");
          done();
        },
      };
      jsonToFsStructure(options);
    });
    it("should produce a nested directory structure when there is an array of strings", (done) => {
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            { andanotherdir: {} },
          ],
        },
        filePath: ".",
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
      };
      jsonToFsStructure(options);
    });
    it("should produce a nested deep complex directory structure", (done) => {
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            {
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        filePath: ".",
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone").size,
            4096,
          );
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone/interiortwo")
              .size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
            ).size,
            4096,
          );
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
          );
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone/interiortwo");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
      };
      jsonToFsStructure(options);
    });
  });
  describe("jsonToFsWithLeafFunction", () => {
    it("should produce a nested deep complex directory structure and execute the procedure on leaves", (done) => {
      const endpoints = [];
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            {
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        filePath: ".",
        leafProcedure: (filePath, acc) => {
          endpoints.push(filePath);
        },
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone").size,
            4096,
          );
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone/interiortwo")
              .size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
            ).size,
            4096,
          );
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
          );
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone/interiortwo");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
      };
      jsonToFsWithLeafFunction(options);
      expect(endpoints).toMatchSnapshot();
    });
    it("should produce a nested directory not past a stop word with a leaf function", (done) => {
      const endpoints = [];
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            {
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        leafProcedure: (filePath, acc) => {
          endpoints.push(filePath);
        },
        filePath: ".",
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
        stopWord: "interiorone",
      };
      jsonToFsWithLeafFunction(options);
      expect(endpoints).toMatchSnapshot();
    });
  });
  describe("jsonToFsWithNonLeafFunction", () => {
    it("should produce a nested deep complex directory structure and execute the procedure on non leaves", (done) => {
      const endpoints = [];
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            {
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        nonLeafProcedure: (filePath, acc) => {
          endpoints.push(filePath);
        },
        filePath: ".",
        context: {},
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone").size,
            4096,
          );
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone/interiortwo")
              .size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
            ).size,
            4096,
          );
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
          );
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone/interiortwo");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
      };
      jsonToFsWithNonLeafFunction(options);
      expect(endpoints).toMatchSnapshot();
    });
  });
  describe("jsonToFsWithFunction", () => {
    it("should produce a nested deep complex directory structure and execute the procedure on everything", (done) => {
      const endpoints = [];
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            {
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        procedure: (filePath, acc) => {
          endpoints.push(filePath);
        },
        filePath: ".",
        context: {},
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone").size,
            4096,
          );
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone/interiortwo")
              .size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
            ).size,
            4096,
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
            ).size,
            4096,
          );
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour",
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree",
          );
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone/interiortwo");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
      };
      jsonToFsWithFunction(options);
      expect(endpoints).toMatchSnapshot();
    });
    it("should not go below the stop word andanotherdir provided", (done) => {
      const endpoints = [];
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            {
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        procedure: (filePath, acc) => {
          endpoints.push(filePath);
        },
        filePath: ".",
        context: {},
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
        stopWord: "andanotherdir",
      };
      jsonToFsWithFunction(options);
      expect(endpoints).toMatchSnapshot();
    });
    it("should not do anything with ignored words like meta", (done) => {
      const endpoints = [];
      const options = {
        jsonObject: {
          testArrayField5: [
            { somedir: { meta: {}, apple: {} } },
            { anotherdir: {} },
            {
              meta: { somethingweird: {} },
              andanotherdir: {
                interiorone: {
                  interiortwo: {
                    apple: { dontdonothing: {} },
                    interiorthree: [{ interiorfour: {} }, { interiorfive: {} }],
                  },
                },
              },
            },
          ],
        },
        procedure: (filePath, acc) => {
          endpoints.push(filePath);
        },
        filePath: ".",
        context: {},
        callback: () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone").size,
            4096,
          );
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone/interiortwo")
              .size,
            4096,
          );
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone/interiortwo");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        },
        ignoredWords: ["meta", "apple"],
        stopWord: "interiorthree",
      };
      jsonToFsWithFunction(options);
      expect(endpoints).toMatchSnapshot();
    });
  });
});
