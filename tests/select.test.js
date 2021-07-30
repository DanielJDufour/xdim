const test = require("flug");
const { select } = require("../index");

test("select all reds then all greens then all blues then all alphas in one flat array", ({ eq }) => {
  // assuming a 2x2 rgba image
  const data = [
    // reds
    0,
    1,
    2,
    3,

    // greens
    4,
    5,
    6,
    7,

    // blues
    8,
    9,
    10,
    11,

    // alphas
    12,
    13,
    14,
    15
  ];

  const layout = "[band,row,column]";

  // bottom left blue
  const point = {
    band: 2, // blue
    row: 1, // second row
    column: 0 // first column
  };

  const sizes = {
    column: 2,
    row: 2
  };

  const result = select({
    data,
    debugLevel: 0,
    layout,
    point,
    sizes
  });
  eq(result.value, 10);
  eq(result.index, 10);
  eq(Array.isArray(result.parent), true);
});

test("select on ImageData", ({ eq }) => {
  // 2x2 image where values consistent per band
  // all the red values are zero
  // all the green values are 1
  const data = [0, 10, 20, 30, 1, 11, 21, 31, 2, 12, 22, 32, 3, 13, 23, 33];
  const layout = "[row,column,band]";

  // green bottom left
  const point = {
    band: 1, // green as it's the second band after red
    row: 1, // second row
    column: 0 // first column
  };

  const result = select({
    data,
    layout,
    point,
    sizes: {
      band: 4,
      column: 2
    }
  });
  eq(result.value, 12);
});

test("select on [band][row,column]", ({ eq }) => {
  const data = [
    [0, 123, 123, 162], // red
    [213, 41, 62, 124], // green
    [84, 52, 124, 235] // blue
  ];
  const layout = "[band][row,column]";
  const sizes = { column: 2 };
  const point = { band: 2, row: 1, column: 1 };
  // offset =  row * ncols + column
  const result = select({ data, debugLevel: 0, layout, point, sizes });
  eq(result.value, 235);
});

test("select on [band][row][column]", ({ eq }) => {
  // eg, 2x2 rgb image
  const data = [
    // red
    [
      [0, 123],
      [123, 162]
    ],

    // green
    [
      [213, 41],
      [62, 124]
    ],

    // blue
    [
      [84, 52],
      [124, 235]
    ]
  ];
  const layout = "[band][row][column]";
  // bottom right and blue
  const point = { band: 2, row: 1, column: 1 };
  const result = select({ data, debugLevel: 0, layout, point });
  eq(result.value, 235);
});
