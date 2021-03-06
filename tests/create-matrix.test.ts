import test from "flug";
import { createMatrix } from "../src/xdim";

test("create flat matrix / vector", ({ eq }) => {
  const matrix = createMatrix({ fill: 8, shape: [5] });
  eq(matrix.length, 5);
  eq(matrix[0], 8);
});

test("create table matrix", ({ eq }) => {
  const matrix = createMatrix({ fill: 8, shape: [20, 80] });
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
