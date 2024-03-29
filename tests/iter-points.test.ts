import test from "flug";
import { iterPoints } from "../src/xdim";

test("iter points", ({ eq }) => {
  const iter = iterPoints({ sizes: { band: 4, row: 768, column: 1024 } });
  eq(iter.next().value, { band: 0, row: 0, column: 0 });
  eq(iter.next().value, { band: 0, row: 0, column: 1 });
  for (let i = 0; i < 1021; i++) iter.next();
  eq(iter.next().value, { band: 0, row: 0, column: 1023 });
  eq(iter.next().value, { band: 0, row: 1, column: 0 });

  let last;
  let it;
  while (((it = iter.next()), !it.done)) {
    last = it.value;
  }
  eq(last, { band: 3, row: 767, column: 1023 });
});

test("iter points with rect", ({ eq }) => {
  const iter = iterPoints({ sizes: { band: 4, row: 768, column: 1024 }, rect: { band: [1, 3] } });
  eq(iter.next().value, { band: 1, row: 0, column: 0 });
  eq(iter.next().value, { band: 1, row: 0, column: 1 });
  for (let i = 0; i < 1021; i++) iter.next();
  eq(iter.next().value, { band: 1, row: 0, column: 1023 });
  eq(iter.next().value, { band: 1, row: 1, column: 0 });

  let last;
  let it;
  while (((it = iter.next()), !it.done)) {
    last = it.value;
  }
  eq(last, { band: 3, row: 767, column: 1023 });
});

test("iter points with order", ({ eq }) => {
  const iter = iterPoints({ order: ["band", "row", "column"], sizes: { band: 4, row: 101, column: 50 } });
  eq(iter.next().value, { band: 0, row: 0, column: 0 });
  eq(iter.next().value, { band: 0, row: 0, column: 1 });
});

test("iter points with rect and order", ({ eq }) => {
  const iter = iterPoints({ order: ["row", "column", "band"], sizes: { band: 4, row: 101, column: 50 }, rect: { band: [1, 3] } });
  eq(iter.next().value, { row: 0, column: 0, band: 1 });
  eq(iter.next().value, { row: 0, column: 0, band: 2 });
});
