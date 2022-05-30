import test from "flug";
import { validateRect } from "../src/xdim";

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

test("validating out of bounds", ({ eq }) => {
  const rect = { band: [0, 0], row: [-6, 6], column: [1, 1] };

  let msg;
  try {
    validateRect({ rect });
  } catch (error: any) {
    msg = error.message;
  }
  eq(msg, "[xdim] uh oh. invalid hyper-rectangle with start -6");
});
