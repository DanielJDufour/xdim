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
    console.log({arr});
    const [match] = arr;
    dims[match] = {
      name: match
    };
  }
  return dims;
}

const parseVectors = str => str.match(/\[[^\]]+\]/g);

module.exports = {
  parseDimensions,
  parseVectors
};
