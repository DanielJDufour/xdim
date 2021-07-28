const { forEach, map } = require("advarr");
/*
  examples:
  [row][column] is

  {
    dimensions: {
      "row": {
        name: "row",
        size: Infinite
      },
      "column": {
        name: "column",
        size: Infinite
      }
    },
    sequence: {
      type: "Sequence",
      sequences: [
        
      ]
    }
  }


*/
function parseDimensions (str) {
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
const removeBraces = str => str.startsWith("[") && str.endsWith("]") ? str.substring(1, str.length - 1) : str;

// "(row)" to "row"
const removeParentheses = str => str.startsWith("(") && str.endsWith(")") ? str.substring(1, str.length - 1) : str;

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
    }
  }
};

function parse (str) {
  const dims = parseDimensions(str);
  const vectors = parseVectors(str);

  vectors.map((vector, i) => {
    // remove outer braces [ ... ]
    const braceless = removeBraces(vector);

    // remove parentheses if its exists
    // as it's not required
    const parenfree = removeParentheses(braceless);

    console.log("parenfree:", [parenfree]);

    const sequences = parseSequences(parenfree);
    
  });

}

module.exports = {
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  removeBraces,
  removeParentheses,
};
