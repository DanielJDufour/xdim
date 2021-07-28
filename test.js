const test = require("flug");
const { parseDimensions } = require('./index');

test("parseDimensions", ({ eq }) => {
  eq(parseDimensions("[row][column]"), {
    row: { name: "row" },
    column: { name: "column" }
  });

  eq(parseDimensions("[band][row,column]"), {
    band: { name: "band" },
    row: { name: "row" },
    column: { name: "column" }
  });
});

// test("table", ({ eq }) => {
//   const keypad = [
//     [1, 2, 3],
//     [4, 5, 6],
//     [7, 8, 9],
//     ["*", 0, "#"]
//   ];
//   const syntax = "[row][column]";
//   const layout = parse(syntax);
//   eq(layout, )
// });