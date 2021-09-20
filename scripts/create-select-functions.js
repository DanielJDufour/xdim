module.exports = function createSelectFunctions({ spacer }) {
  const funcs = {};
  for (let depth = 1; depth <= 5; depth++) {
    for (let ct = 1; ct <= 5; ct++) {
      let summary = new Array(depth - 1).fill(1).concat([ct]);
      let func = `<delprev>function ({ point }) { const parent = this.data`;
      const maxDepth = summary.length - 1;
      summary.forEach((len, depth) => {
        if (len === 1) {
          if (depth == maxDepth) {
            func += ";"; // close off parent
            func += ` const index = point[this.d${depth}v0];`;
            func += ` return { parent, index, value: parent[index] }`;
          } else {
            // depth X var Y
            func += `[point[this.d${depth}v0]]`;
          }
        } else {
          if (depth === maxDepth) {
            func += ";"; // close off parent
            func += " const index = ";
            for (let i = 0; i < len; i++) {
              if (i > 0) func += "+";
              func += `this.m${depth}v${i}*point[this.d${depth}v${i}]`;
            }
            func += ";"; // close off index
            func += ` return { parent, index, value: parent[index] }`;
          } else {
            func += "[";
            for (let i = 0; i < len; i++) {
              if (i > 0) func += "+";
              func += `this.m${depth}v${i}*point[this.d${depth}v${i}]`;
            }
            func += "]";
          }
        }
      });
      func += "; }<delnext>";
      funcs[summary] = func;
    }
  }
  return JSON.stringify(funcs, undefined, spacer)
    .replace(/"<delprev>/g, "")
    .replace(/<delnext>"/g, "");
};
