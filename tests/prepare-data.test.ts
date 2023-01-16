import test from "flug";
import { prepareData } from "../src/xdim";

test("prepareData ImageData.data", ({ eq }) => {
  const layout = "[row,column,band]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const result = prepareData({ fill: 9, layout, sizes, arrayTypes: ["Uint8ClampedArray"] });
  eq(result.shape, [4 * 1024 * 768]);
  eq(result.data, new Uint8ClampedArray(4 * 1024 * 768).fill(9));
});

test("prepare multi-band data", ({ eq }) => {
  const layout = "[band][row,column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const result = prepareData({ fill: 9, layout, sizes, arrayTypes: ["Uint8ClampedArray"] });
  eq(result.shape, [4, 1024 * 768]);
  eq(result.data.length, 4);
  eq(result.data[0].length, 1024 * 768);
  eq(result.data.constructor.name, "Array");
  eq(result.data[0].constructor.name, "Uint8ClampedArray");
  eq(result.data[0][0], 9);
});

test("inconsistent variable checking", ({ eq }) => {
  let msg;
  try {
    prepareData({
      layout: "[row,column,band]",
      sizes: { band: 4, height: 638, width: 860 }
    });
  } catch (error: any) {
    msg = error.message;
  }
  eq(msg.includes("could not find"), true);
});

test("prepareData band * table", ({ eq }) => {
  const layout = "[band][row,column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const result = prepareData({ layout, sizes });
  eq(result.data.length, 4);
  eq(result.shape, [4, 1024 * 768]);
  eq(
    result.data.every(row => row.length === 1024 * 768),
    true
  );
});

test("prepareData: 3D", ({ eq }) => {
  const layout = "[band][row][column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const { data, shape } = prepareData({ layout, sizes });
  eq(shape, [4, 768, 1024]);
  eq(data.length, 4);
  eq(data[0].length, 768);
  eq(data[0][0].length, 1024);
});

test("prepareData: zero fill", ({ eq }) => {
  const fill = 9;
  const { data } = prepareData({
    fill,
    layout: "[row][column][band]",
    sizes: { band: 3, row: 64, column: 64 },
    arrayTypes: undefined
  });
  eq(
    data[0][0].every(n => n === fill),
    true
  );
});
