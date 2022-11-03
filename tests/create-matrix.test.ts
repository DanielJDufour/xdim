import test from "flug";
import { createMatrix } from "../src/xdim";

test("create bare bones matrix", ({ eq }) => {
  const matrix = createMatrix({ shape: [1, 2, 3] as const });
  eq(matrix.length, 1);
  eq(matrix[0].length, 2);
  eq(matrix[0][0].length, 3);
});

test("create flat matrix / vector", ({ eq }) => {
  const matrix = createMatrix({ fill: 8 as const, shape: [5] as const });
  eq(matrix.length, 5);
  eq(matrix[0], 8);
});

test("create table matrix", ({ eq }) => {
  const matrix = createMatrix({ fill: 8 as const, shape: [20, 80] as const });
  eq(matrix.length, 20);
  eq(
    matrix.every(it => it.length === 80),
    true
  );
  eq(
    matrix.every(sub => sub.every((it: number) => it === 8)),
    true
  );
});

test("create flat Uint8Array", ({ eq }) => {
  const arrayTypes = ["Uint8Array"] as const;
  const matrix = createMatrix({ fill: 0, shape: [100] as const, arrayTypes });
  eq(matrix.length, 100);
  eq(matrix.constructor.name, arrayTypes[0]);
});

test("create 2-D Uint8Array", ({ eq }) => {
  const arrayTypes = ["Array", "Uint8Array"] as const;
  // like a 4-band raster with 10 width and 10 height
  const matrix = createMatrix({ fill: 0, shape: [4, 10] as const, arrayTypes });
  eq(matrix.length, 4);
  eq(matrix.constructor.name, "Array");
  eq(
    matrix.every(subarray => subarray.length === 10),
    true
  );
  eq(
    matrix.every(subarray => subarray.constructor.name === "Uint8Array"),
    true
  );
});

test("create 3-D Uint8Array", ({ eq }) => {
  // like a 4-band raster with 10 width and 10 height
  const matrix = createMatrix({ fill: 0, shape: [4, 6, 8] as const, arrayTypes: ["Array", "Array", "Uint8Array"] });
  eq(matrix.length, 4);
  eq(matrix.constructor.name, "Array");
  eq(matrix[0].length, 6);
  eq(matrix[0][0].length, 8);
  eq(matrix[0][0].constructor.name, "Uint8Array");
});
