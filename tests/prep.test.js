const test = require("flug");
const { prep } = require("../index");

test("prep ImageData.data", ({ eq }) => {
  const debugLevel = 0;
  const layout = "[row,column,band]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768,
  };
  const result = prep({ debugLevel, layout, sizes });
  eq(result.shape, [4 * 1024 * 768]);
  eq(result.matrix, new Array(4 * 1024 * 768).fill(undefined));
});

test("prep band * table", ({ eq }) => {
  const debugLevel = 0;
  const layout = "[band][row,column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768,
  };
  const result = prep({ debugLevel, layout, sizes });
  eq(result.matrix.length, 4);
  eq(result.shape, [4, 1024 * 768]);
  eq(result.matrix.every(row => row.length === 1024 * 768), true);
});

test("prep: 3D", ({ eq }) => {
  const debugLevel = 0;
  const layout = "[band][row][column]";
  const sizes = {
    band: 4,
    column: 1024,
    row: 768,
  };
  const result = prep({ debugLevel, layout, sizes });
  eq(result.shape, [4, 768, 1024]);
  eq(result.matrix.length, 4);
  eq(result.matrix[0].length, 768);
  eq(result.matrix[0][0].length, 1024);
});
