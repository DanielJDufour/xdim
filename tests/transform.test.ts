import test from "flug";
import { transform } from "../src/xdim";

test("inflating image data", ({ eq }) => {
  const data = [0, 10, 20, 30, 1, 11, 21, 31, 2, 12, 22, 32, 3, 13, 23, 33];
  const result = transform({
    data,
    from: "[row,column,band]",
    to: "[band][row][column]",
    sizes: {
      band: 4,
      column: 2,
      row: 2
    }
  });
  eq(result.data.length, 4);
  eq(result.data[0].length, 2);
  eq(result.data[0][0].length, 2);
  eq(result.data[0][0][0], 0);
  eq(result.data[0][1][1], 3);
});
