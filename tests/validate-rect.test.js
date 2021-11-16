const test = require("flug");
const { validateRect } = require("../src/xdim");

test("validating invalid rectangle", ({ eq }) => {
  const rect = { band: [0, 0], row: [6, 5], column: [1, 1] };

  let threw = false;
  try {
    validateRect({ rect });
  } catch (error) {
    threw = true;
  }
  eq(threw, true);
});

test("validating valid rectangle", ({ eq }) => {
  const rect = { band: [0, 0], row: [6, 6], column: [1, 1] };

  let threw = false;
  try {
    validateRect({ rect });
  } catch (error) {
    console.error(error);
    threw = true;
  }
  eq(threw, false);
});
