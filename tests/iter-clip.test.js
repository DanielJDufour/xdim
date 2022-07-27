import test from "flug";
import { iterClip } from "../src/xdim";

const range = ct => new Array(ct).fill(0).map((_, i) => i);

const pixelDepth = 4;
const height = 768;
const width = 1024;
const data = range(pixelDepth).map(band => {
  return range(height).map(row => {
    return range(width).map(column => {
      return { b: band, r: row, c: column };
    });
  });
});

test("iter clip with rect", ({ eq }) => {
  const iter = iterClip({ data, layout: "[band][row][column]", sizes: { band: 4, row: 768, column: 1024 }, rect: { band: [1, 3] } });
  eq(iter.next().value, { b: 1, r: 0, c: 0 });
  eq(iter.next().value, { b: 1, r: 0, c: 1 });
  for (let i = 0; i < 1021; i++) iter.next();
  eq(iter.next().value, { b: 1, r: 0, c: 1023 });
  eq(iter.next().value, { b: 1, r: 1, c: 0 });

  let last;
  for (last of iter);
  eq(last, { b: 3, r: 767, c: 1023 });
});

test("iter clip with rect and order", ({ eq }) => {
  const iter = iterClip({
    data,
    layout: "[band][row][column]",
    order: ["row", "column", "band"],
    sizes: { band: 4, row: 768, column: 1024 },
    rect: { band: [1, 3] }
  });
  eq(iter.next().value, { b: 1, r: 0, c: 0 });
  eq(iter.next().value, { b: 2, r: 0, c: 0 });
});
