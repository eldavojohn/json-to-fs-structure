import * as fs from "fs";
import { sep } from "path";

// Type definitions for callbacks
export type LeafProcedure<T = unknown> = (
  filePath: string,
  accumulator: T,
  value: unknown,
  property: string,
) => void;

export type NonLeafProcedure<T = unknown> = (
  filePath: string,
  accumulator: T,
  value: unknown,
  property: string,
) => T | void;

export type Procedure<T = unknown> = (
  filePath: string,
  accumulator: T,
  value: unknown,
  property: string,
) => T | void;

export interface ExecutorObject<T> {
  leafProcedure?: LeafProcedure<T>;
  nonLeafProcedure?: NonLeafProcedure<T>;
  procedure?: Procedure<T>;
  accumulator?: T;
}

export interface JsonToFsStructureOptions {
  jsonObject: unknown;
  filePath?: string;
  callback?: () => void;
  stopWord?: string | string[];
  spaceReplace?: string;
  ignoredWords?: string[];
}

export interface JsonToFsWithLeafFunctionOptions<T = unknown> {
  jsonObject: unknown;
  leafProcedure?: LeafProcedure<T>;
  context?: T;
  filePath?: string;
  callback?: () => void;
  stopWord?: string | string[];
  spaceReplace?: string;
  ignoredWords?: string[];
}

export interface JsonToFsWithNonLeafFunctionOptions<T = unknown> {
  jsonObject: unknown;
  nonLeafProcedure?: NonLeafProcedure<T>;
  context?: T;
  filePath?: string;
  callback?: () => void;
  stopWord?: string | string[];
  spaceReplace?: string;
  ignoredWords?: string[];
}

export interface JsonToFsWithFunctionOptions<T = unknown> {
  jsonObject: unknown;
  procedure?: Procedure<T>;
  context?: T;
  filePath?: string;
  callback?: () => void;
  stopWord?: string | string[];
  spaceReplace?: string;
  ignoredWords?: string[];
}

const isLeaf = (testNode: unknown): boolean =>
  testNode !== null &&
  testNode !== undefined &&
  typeof testNode === "object" &&
  testNode.constructor === Object &&
  Object.keys(testNode).length === 0;

const isEqualOrIsInArray = (
  property: string,
  stopWord: string | string[] | undefined,
): boolean =>
  !!stopWord &&
  (property === stopWord ||
    (Array.isArray(stopWord) && stopWord.indexOf(property) > -1));

const cloneAccumulator = <T>(acc: T | undefined): T => {
  return Object.assign({}, acc) as unknown as T;
};

const levelPropertiesToDirectories = <T>(
  obj: unknown,
  filePath: string,
  stopWord: string | string[] | undefined,
  ignoredWords: string[],
  spaceReplace: string | undefined,
  executorObject: ExecutorObject<T> = {},
): Promise<void>[] => {
  if (obj && (typeof obj === "string" || obj instanceof String)) {
    return [];
  }
  const { leafProcedure, nonLeafProcedure, procedure } = executorObject;
  let { accumulator } = executorObject;
  let promiseArray: Promise<void>[] = [];
  let fields: string[] = [];

  if (obj && Array.isArray(obj)) {
    obj.forEach((arrayObject: unknown) => {
      promiseArray = promiseArray.concat(
        levelPropertiesToDirectories(
          arrayObject,
          filePath,
          stopWord,
          ignoredWords,
          spaceReplace,
          {
            leafProcedure,
            nonLeafProcedure,
            procedure,
            accumulator,
          },
        ),
      );
    });
  } else if (obj && typeof obj === "object") {
    fields = Object.keys(obj);
  }

  fields.forEach((property) => {
    if (
      !isEqualOrIsInArray(property, stopWord) &&
      ignoredWords.indexOf(property) === -1
    ) {
      const newPath = spaceReplace
        ? `${filePath}${sep}${property.replace(/ /g, spaceReplace)}`
        : `${filePath}${sep}${property}`;
      let accumulatorCopy = cloneAccumulator(accumulator);
      try {
        fs.mkdirSync(newPath);
      } catch (e) {}

      const objRecord = obj as Record<string, unknown>;
      const value = objRecord[property];

      if (value && typeof value === "object" && Object.keys(value).length > 0) {
        if (nonLeafProcedure) {
          accumulatorCopy = nonLeafProcedure(
            newPath,
            cloneAccumulator(accumulator),
            value,
            property,
          ) as T;
        }
        if (procedure) {
          accumulatorCopy = procedure(
            newPath,
            cloneAccumulator(accumulator),
            value,
            property,
          ) as T;
        }
        promiseArray = promiseArray.concat(
          levelPropertiesToDirectories(
            value,
            newPath,
            stopWord,
            ignoredWords,
            spaceReplace,
            {
              leafProcedure,
              nonLeafProcedure,
              procedure,
              accumulator: accumulatorCopy,
            },
          ),
        );
      } else {
        if (leafProcedure && isLeaf(value)) {
          leafProcedure(
            newPath,
            cloneAccumulator(accumulator),
            value,
            property,
          );
        }
        if (procedure && isLeaf(value)) {
          accumulatorCopy = procedure(
            newPath,
            cloneAccumulator(accumulator),
            value,
            property,
          ) as T;
        }
      }
    } else if (ignoredWords.indexOf(property) === -1) {
      if (leafProcedure) {
        const objRecord = obj as Record<string, unknown>;
        const value = objRecord[property];
        leafProcedure(
          `${filePath}${sep}`,
          cloneAccumulator(accumulator),
          value,
          property,
        );
      }
    }
  });
  return promiseArray;
};

export function jsonToFsStructure({
  jsonObject,
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace,
  ignoredWords = [],
}: JsonToFsStructureOptions): Promise<void> {
  return Promise.all(
    levelPropertiesToDirectories(
      jsonObject,
      filePath,
      stopWord,
      ignoredWords,
      spaceReplace,
    ),
  ).then(callback);
}

export function jsonToFsWithLeafFunction<T = unknown>({
  jsonObject,
  leafProcedure = () => {},
  context = {} as T,
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace,
  ignoredWords = [],
}: JsonToFsWithLeafFunctionOptions<T>): Promise<void> {
  return Promise.all(
    levelPropertiesToDirectories(
      jsonObject,
      filePath,
      stopWord,
      ignoredWords,
      spaceReplace,
      {
        leafProcedure,
        accumulator: context,
      },
    ),
  ).then(callback);
}

export function jsonToFsWithNonLeafFunction<T = unknown>({
  jsonObject,
  nonLeafProcedure = () => {},
  context = {} as T,
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace,
  ignoredWords = [],
}: JsonToFsWithNonLeafFunctionOptions<T>): Promise<void> {
  return Promise.all(
    levelPropertiesToDirectories(
      jsonObject,
      filePath,
      stopWord,
      ignoredWords,
      spaceReplace,
      {
        nonLeafProcedure,
        accumulator: context,
      },
    ),
  ).then(callback);
}

export function jsonToFsWithFunction<T = unknown>({
  jsonObject,
  procedure = () => {},
  context = {} as T,
  filePath = ".",
  callback = () => {},
  stopWord,
  spaceReplace,
  ignoredWords = [],
}: JsonToFsWithFunctionOptions<T>): Promise<void> {
  return Promise.all(
    levelPropertiesToDirectories(
      jsonObject,
      filePath,
      stopWord,
      ignoredWords,
      spaceReplace,
      {
        procedure,
        accumulator: context,
      },
    ),
  ).then(callback);
}
