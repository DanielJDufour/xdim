const test = require("flug");
const { prepareData } = require("../src/xdim");

test("prepareData ImageData.data", ({ eq }) => {
  const debugLevel = 0;
  const layout = "[row,column,band]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const result = prepareData({ debugLevel, layout, sizes });
  eq(result.shape, [4 * 1024 * 768]);
  eq(result.data, new Array(4 * 1024 * 768).fill(undefined));
});

test("prepareData band * table", ({ eq }) => {
  const debugLevel = 0;
  const layout = "[band][row,column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const result = prepareData({ debugLevel, layout, sizes });
  eq(result.data.length, 4);
  eq(result.shape, [4, 1024 * 768]);
  eq(
    result.data.every(row => row.length === 1024 * 768),
    true
  );
});

test("prepareData: 3D", ({ eq }) => {
  const debugLevel = 0;
  const layout = "[band][row][column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768
  };
  const result = prepareData({ debugLevel, layout, sizes });
  eq(result.shape, [4, 768, 1024]);
  eq(result.data.length, 4);
  eq(result.data[0].length, 768);
  eq(result.data[0][0].length, 1024);
});
