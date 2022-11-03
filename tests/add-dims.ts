import test from "flug";
import { addDims } from "../src/xdim";

test("addDims", ({ eq }) => {
  eq(addDims({ arr: [[], [], []], lens: [3], fill: 0 }), [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);
});
