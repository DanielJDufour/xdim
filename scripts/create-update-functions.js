module.exports = function createUpdateFunctions({ spacer }) {
  const funcs = {};
  for (let depth = 1; depth <= 5; depth++) {
    for (let ct = 1; ct <= 5; ct++) {
      let summary = new Array(depth - 1).fill(1).concat([ct]);
      let func = `<delprev>function ({ point, value }) { this.data`;
      summary.forEach((len, depth) => {
        if (len === 1) {
          func += `[point[this.d${depth}v0]]`;
        } else {
          func += "[";
          for (let i = 0; i < len; i++) {
            if (i > 0) func += "+";
            func += `this.m${depth}v${i}*point[this.d${depth}v${i}]`;
          }
          func += "]";
        }
      });
      func += " = value; }<delnext>";
      funcs[summary] = func;
    }
  }
  return JSON.stringify(funcs, undefined, spacer)
    .replace(/"<delprev>/g, "")
    .replace(/<delnext>"/g, "");
};
