const createSelectFunctions = require("./create-select-functions.js");
const { writeFileSync } = require("fs");

const textSelect = "module.exports = " + createSelectFunctions({ spacer: 2 });

writeFileSync("./src/prepared-select-funcs.js", textSelect, "utf-8");

const createUpdateFunctions = require("./create-update-functions.js");

const textUpdate = "module.exports = " + createUpdateFunctions({ spacer: 2 });

writeFileSync("./src/prepared-update-funcs.js", textUpdate, "utf-8");
