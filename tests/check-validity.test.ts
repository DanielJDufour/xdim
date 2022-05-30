import test from "flug";
import { checkValidity } from "../src/xdim";

test("valid", ({ eq }) => {
  const valid = checkValidity("[band][row,column]");
  eq(valid, true);
});

test("invalid", ({ eq }) => {
  let msg;
  try {
    checkValidity("[band,(row,column)]");
  } catch (e: any) {
    msg = e.message;
  }
  eq(msg.includes("invalid"), true);
});
