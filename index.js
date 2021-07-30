function parseDimensions(str) {
  const dims = {};
  const re = /[A-Za-z]+/g;
  let arr;
  while ((arr = re.exec(str)) !== null) {
    const [match] = arr;
    dims[match] = {
      name: match
    };
  }
  return dims;
}

const parseVectors = str => str.match(/\[[^\]]+\]/g);

// "[row]" to "row"
const removeBraces = str => (str.startsWith("[") && str.endsWith("]") ? str.substring(1, str.length - 1) : str);

// "(row)" to "row"
const removeParentheses = str => (str.startsWith("(") && str.endsWith(")") ? str.substring(1, str.length - 1) : str);

// sort of like parsing a CSV except instead of " for quotes use (
const matchSequences = str => str.match(/(\(.*?\)|[^\(,\s]+)(?=\s*,|\s*$)/g);

const parseSequences = str => {
  // unwrap [...]
  str = removeBraces(str);

  // unwrap (...)
  str = removeParentheses(str);

  const seqs = matchSequences(str);

  if (seqs.length === 1) {
    return {
      type: "Vector",
      dim: seqs[0]
    };
  } else {
    return {
      type: "Matrix",
      parts: seqs.map(parseSequences)
    };
  }
};

function checkValidity(str) {
  const invalid = str.match(/[^ A-Za-z,\[\]]/g);
  if (invalid) {
    throw new Error("The following invalid characters were used: " + invalid.map(c => `"${c}"`).join(", "));
  } else {
    return true;
  }
}

function parse(str) {
  checkValidity(str);

  const vectors = parseVectors(str);
  return {
    type: "Layout",
    dims: vectors.map(parseSequences)
  };
}

function select({ data, debugLevel = 0, layout, point, sizes = {} }) {
  if (debugLevel >= 1) console.log("starting select with", { data, debugLevel, layout, point });

  // converts layout expression to a Layout object
  if (typeof layout === "string") layout = parse(layout);
  if (debugLevel >= 2) console.log("layout object is:", layout);

  const dims = Object.keys(point);

  // dims are arrays
  // let obj = data;
  const value = layout.dims.reduce((data, arr) => {
    if (debugLevel >= 2) console.log("arr:", arr);
    if (arr.type === "Vector") {
      const i = point[arr.dim];
      data = data[i];
    } else if (arr.type === "Matrix") {
      const { parts } = arr;
      let offset = 0;
      let multiplier = 1;
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        // console.log({part});
        if (part.type === "Matrix") {
          // need to make this function recursive...
          // also probably need to make a distinction between recursive inteleaving
          // and actually hard array boundaries
          // shouldn't be calling them both Matrix
          // maybe MultiSequence or Sequence??
        } else if (part.type === "Vector") {
          // console.log({multiplier});
          const { dim } = part;
          offset += multiplier * point[dim];
          // console.log({offset, sizes, dim});
          if (i > 0) {
            if (!(dim in sizes)) throw new Error(`you cannot calculate the location without knowing the size of the "${dim}" dimension.`);
            multiplier *= sizes[dim];
          }
        }
      }
      data = data[offset];
    }
    return data;
  }, data);

  return { value };
}

// // add dimension to an array until the limit reaches zero
function addDims({ arr, fill=undefined, lens }) {
  // no new dimensions to add
  if (lens.length === 0) return arr;

  const len = lens[0];
  if (lens.length === 0) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(len).fill(fill);
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const sub = new Array(len).fill(fill);
      arr[i] = sub;
      addDims({ arr: sub, lens: lens.slice(1) });
    }
  }
  return arr;
}

function createMatrix({ fill = undefined, shape }) {
  const len = shape[0];
  const arr = new Array(len).fill(fill);
  return addDims({ arr, fill, lens: shape.slice(1) });
}

/*
  Generates an in-memory data structure to hold the data
*/
function prep({ debugLevel=0, layout, sizes }) {
  if (typeof layout === "string") layout = parse(layout);
  if (debugLevel >= 2) console.log("layout:", layout);

  const shape = layout.dims.map(it => {
    if (it.type === "Vector") {
      return sizes[it.dim];
    } else if (it.type === "Matrix") {
      return it.parts.reduce((total, pt) => total * sizes[pt.dim], 1);
    }
  });
  if (debugLevel >= 2) console.log("shape:", shape);

  const matrix = createMatrix({ fill: undefined, shape });

  return { matrix, shape };
}

function transform({ data, from, to, sizes }) {
  if (typeof from === "string") from = parse(from);
  if (typeof to === "string") to = parse(to);

  const result = prep({ layout: to });
}

module.exports = {
  checkValidity,
  createMatrix,
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  prep,
  removeBraces,
  removeParentheses,
  select,
  transform
};
