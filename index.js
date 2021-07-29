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

module.exports = {
  checkValidity,
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  removeBraces,
  removeParentheses,
  select
};
