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
