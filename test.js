const test = require("flug");
const {
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  removeBraces,
  removeParentheses,
  select
} = require('./index');

test("parseDimensions", ({ eq }) => {
  eq(
    parseDimensions("[row][column]"),
    {
      row: { name: "row" },
      column: { name: "column" }
    }
  );

  eq(
    parseDimensions("[band][row,column]"),
    {
      band: { name: "band" },
      row: { name: "row" },
      column: { name: "column" }
    }
  );
});

test("parseVectors", ({ eq }) => {
  eq(
    parseVectors("[row][column]"),
    [ '[row]', '[column]' ]
  );
});

test("removing braces", ({ eq }) => {
  eq(removeBraces("[row]"), "row");
  eq(removeBraces("[(row)]"), "(row)");
  eq(removeBraces("row"), "row");
});

test("removing parentheses", ({ eq }) => {
  eq(removeParentheses("[row]"), "[row]");
  eq(removeParentheses("(row)"), "row");
  eq(removeParentheses("row"), "row");
});

test("matching sequences", ({ eq }) => {
  eq(matchSequences("band,row,column"), ["band", "row", "column"]);
  eq(matchSequences("band,(row,column)"), ["band", "(row,column)"]);
});

test("parsing one-level sequence", ({ eq }) => {
  const str = "band,row,column";
  const result = parseSequences(str);
  eq(result, {
    type: "Matrix",
    parts: [
      { type: "Vector", dim: "band" },
      { type: "Vector", dim: "row" },
      { type: "Vector", dim: "column" }
    ]
  });
});

test("parsing multi-level vectors", ({ eq }) => {
  const str = "band,(row,column)";
  const result = parseSequences(str);
  eq(result, {
    type: "Matrix",
    parts: [
      {type: "Vector", dim: "band" },
      {
        type: "Matrix",
        parts: [
          { type: "Vector", dim: "row" },
          { type: "Vector", dim: "column" }
        ]
      }
    ]
  })
});

test("table", ({ eq }) => {
  const keypad = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["*", 0, "#"]
  ];
  const syntax = "[row][column]";
  const layout = parse(syntax);
  eq(layout, {
    type: 'Layout',
    dims: [ { type: 'Vector', dim: 'row' }, { type: 'Vector', dim: 'column' } ]
  });
});

test("imagedata", ({ eq }) => {
  // 2 * 2 image with consistent band values
  // all reds are 0, all greens are 1, all blues are 3, and all alphas are 3
  // data is like [
  //   0, 1, 2, 3, 0, 1, 2, 3,
  //   0, 1, 2, 3, 0, 1, 2, 3
  // ];
  const syntax = "[band,row,column]";
  const layout = parse(syntax);
  eq(layout, {
    "type": "Layout",
    "dims": [
      {
        "type":"Matrix",
        "parts": [
          {"type":"Vector","dim":"band"},
          {"type":"Vector","dim":"row"},
          {"type":"Vector","dim":"column"}
        ]
      }
    ]
  });
});

test("geotiff", ({ eq }) => {
  const str = "[band][row,column]";
  const layout = parse(str);
  eq(layout, {
    type: "Layout",
    dims: [
      { type: "Vector", "dim": "band" },
      {
        type: "Matrix",
        parts: [
          {"type":"Vector","dim":"row"},
          {"type":"Vector","dim":"column"}
        ]
      }
    ]
  });
});

test("select on ImageData", ({ eq }) => {
  // 2x2 image where values consistent per band
  const data = [
    0, 1, 2, 3, 0, 1, 2, 3,
    0, 1, 2, 3, 0, 1, 2, 3
  ];
  const layout = "[band,row,column]";

  // green bottom left
  const point = {
    band: 1, // green as it's the second band after red
    row: 1, // second row
    column: 0, // first column
  }

  const value = select({
    data,
    layout,
    point,
    sizes: {
      column: 2,
      row: 2
    }
  });
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
  const value = select({ data, debugLevel: 3, layout, point, sizes });
  eq(value, 235);
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
  const value = select({ data, debugLevel: 0, layout, point });
  eq(value, 235);
});