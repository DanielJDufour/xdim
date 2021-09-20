const generateFunctions = require("./generate-functions.js");
const { writeFileSync } = require("fs");

const text = "module.exports = " + generateFunctions({ spacer: 2 });

writeFileSync("./src/funcs.js", text, "utf-8");
