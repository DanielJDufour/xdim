const test = require("flug");
const { checkValidity } = require("../index");

test("valid", ({ eq }) => {
  const valid = checkValidity("[band][row,column]");
  eq(valid, true);
});

test("invalid", ({ eq }) => {
  let msg;
  try {
    checkValidity("[band,(row,column)]")
  } catch (e) {
    msg = e.message;
  }
  eq(msg.includes("invalid"), true);
});