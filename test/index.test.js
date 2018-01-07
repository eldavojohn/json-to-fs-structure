const assert = require("assert");
const fs = require("fs");

const { jsonToFsStructure } = require("../index");

describe("json-to-fs-structure", () => {
  describe("jsonToFsStructure", () => {
    it("should produce a simple directory with a first layer object", done => {
      jsonToFsStructure(
        {
          testDirectoryField: {}
        },
        ".",
        () => {
          assert.equal(fs.statSync("testDirectoryField").size, 4096);
          fs.rmdirSync("testDirectoryField");
          done();
        }
      );
    });
    it("should produce a simple directory with a first layer object with siblings", done => {
      jsonToFsStructure(
        {
          testDirectoryField0: {},
          testDirectoryField1: {},
          testDirectoryField2: {}
        },
        ".",
        () => {
          assert.equal(fs.statSync("testDirectoryField0").size, 4096);
          assert.equal(fs.statSync("testDirectoryField1").size, 4096);
          assert.equal(fs.statSync("testDirectoryField2").size, 4096);
          fs.rmdirSync("testDirectoryField0");
          fs.rmdirSync("testDirectoryField1");
          fs.rmdirSync("testDirectoryField2");
          done();
        }
      );
    });
    it("should produce a nested directory structure", done => {
      jsonToFsStructure(
        {
          testDirectoryField3: { innerTestField: {} }
        },
        ".",
        () => {
          assert.equal(
            fs.statSync("testDirectoryField3/innerTestField").size,
            4096
          );
          fs.rmdirSync("testDirectoryField3/innerTestField");
          fs.rmdirSync("testDirectoryField3");
          done();
        }
      );
    });
    it("should produce a nested directory structure when there is an array of strings", done => {
      jsonToFsStructure(
        {
          testArrayField5: [
            { somedir: {} },
            { anotherdir: {} },
            { andanotherdir: {} }
          ]
        },
        ".",
        () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        }
      );
    });
    it("should produce a nested deep complex directory structure", done => {
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
        },
        ".",
        () => {
          assert.equal(fs.statSync("testArrayField5/somedir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/anotherdir").size, 4096);
          assert.equal(fs.statSync("testArrayField5/andanotherdir").size, 4096);
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone").size,
            4096
          );
          assert.equal(
            fs.statSync("testArrayField5/andanotherdir/interiorone/interiortwo")
              .size,
            4096
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree"
            ).size,
            4096
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour"
            ).size,
            4096
          );
          assert.equal(
            fs.statSync(
              "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive"
            ).size,
            4096
          );
          fs.rmdirSync("testArrayField5/somedir");
          fs.rmdirSync("testArrayField5/anotherdir");
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfive"
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree/interiorfour"
          );
          fs.rmdirSync(
            "testArrayField5/andanotherdir/interiorone/interiortwo/interiorthree"
          );
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone/interiortwo");
          fs.rmdirSync("testArrayField5/andanotherdir/interiorone");
          fs.rmdirSync("testArrayField5/andanotherdir");
          fs.rmdirSync("testArrayField5");
          done();
        }
      );
    });
  });
});
