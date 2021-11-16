const test = require("flug");
const { iterPoints } = require("../src/xdim");

test("iter points", ({ eq }) => {
  const iter = iterPoints({ sizes: { band: 4, row: 768, column: 1024 } });
  eq(iter.next().value, { band: 0, row: 0, column: 0 });
  eq(iter.next().value, { band: 0, row: 0, column: 1 });
  for (let i = 0; i < 1021; i++) iter.next();
  eq(iter.next().value, { band: 0, row: 0, column: 1023 });
  eq(iter.next().value, { band: 0, row: 1, column: 0 });

  let last;
  for (last of iter);
  eq(last, { band: 3, row: 767, column: 1023 });
});

test("iter points with rect", ({ eq }) => {
  const iter = iterPoints({ sizes: { band: 4, row: 768, column: 1024 }, rect: { band: [1, 3] } });
  eq(iter.next().value, { band: 1, row: 0, column: 0 });
  eq(iter.next().value, { band: 1, row: 0, column: 1 });
  for (let i = 0; i < 1021; i++) iter.next();
  eq(iter.next().value, { band: 1, row: 0, column: 1023 });
  eq(iter.next().value, { band: 1, row: 1, column: 0 });

  let last;
  for (last of iter);
  eq(last, { band: 3, row: 767, column: 1023 });
});
