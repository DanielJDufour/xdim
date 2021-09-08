const test = require("flug");
const { update } = require("../index");

test("simple updates", ({ eq }) => {
  // flat array of rgba values
  const numBands = 4;
  const width = 5;
  const height = 3;
  const data = new Array(numBands * width * height).fill(0);
  eq(
    data.every(n => n === 0),
    true
  );
  eq(data.length, 60);

  const band = 3;
  const row = 2;
  const column = 1;
  update({
    data,
    debugLevel: 0,
    layout: "[row,column,band]",
    point: {
      band,
      row,
      column
    },
    sizes: {
      band: numBands,
      column: width,
      row: height
    },
    value: 0.5
  });
  eq(data.indexOf(0.5), numBands * row * width + numBands * column + band);
});
