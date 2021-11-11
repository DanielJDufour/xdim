const test = require("flug");
const { iterRange } = require("../src/xdim");

test("iter range", ({ eq }) => {
  const range = Array.from(iterRange({ start: 1, end: 9 }));
  eq(range, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
