const test = require("flug");
const {
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  removeBraces,
  removeParentheses
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
  console.log("layout:", layout);
});