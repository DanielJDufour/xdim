const layoutCache = {};

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

function parse(str, { useLayoutCache = true } = { useLayoutCache: true }) {
  if (useLayoutCache && str in layoutCache) return layoutCache[str];

  checkValidity(str);

  const vectors = parseVectors(str);
  const result = {
    type: "Layout",
    dims: vectors.map(parseSequences)
  };

  if (useLayoutCache) layoutCache[str] = result;

  return result;
}

function update({ useLayoutCache = true, data, layout, point, sizes = {}, value }) {
  if (typeof layout === "string") layout = parse(layout, { useLayoutCache });

  const { dims } = layout;
  for (let idim = 0; idim < dims.length; idim++) {
    const last = idim === dims.length - 1;
    const arr = dims[idim];
    let offset;
    if (arr.type === "Vector") {
      offset = point[arr.dim];
    } else {
      // arr.type assumed to be "Matrix"
      const { parts } = arr;
      offset = 0;
      let multiplier = 1;
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        const { dim } = part;
        offset += multiplier * point[dim];
        if (i > 0) {
          if (!(dim in sizes)) throw new Error(`you cannot calculate the location without knowing the size of the "${dim}" dimension.`);
          multiplier *= sizes[dim];
        }
      }
    }
    if (last) {
      data[offset] = value;
    } else {
      data = data[offset];
    }
  }
}

// clip a hyperrectangle (a multi-dimensional rectangle)
// returns an array of numbers
function clip({ useLayoutCache = true, data, layout, rect, sizes = {} }) {
  if (typeof layout === "string") layout = parse(layout, { useLayoutCache });

  let datas = [data];

  layout.dims.forEach(arr => {
    let new_datas = [];
    datas.forEach(data => {
      if (arr.type === "Vector") {
        const { start, end } = rect[arr.dim];
        new_datas = new_datas.concat(data.slice(start, end + 1));
      } else {
        // only 2 types so must be arr.type === "Matrix"
        const { parts } = arr;
        let offsets = [0];
        let multiplier = 1;
        for (let i = parts.length - 1; i >= 0; i--) {
          const part = parts[i];
          // assume part.type === "Vector"
          const { dim } = part;
          const { start, end } = rect[dim];
          const new_offsets = [];
          for (let n = start; n <= end; n++) {
            offsets.forEach(offset => {
              new_offsets.push(offset + multiplier * n);
            });
          }
          offsets = new_offsets;
          multiplier *= sizes[dim];
        }
        offsets.forEach(offset => {
          new_datas.push(data[offset]);
        });
      }
    });
    datas = new_datas;
  });

  return { data: datas };
}

function select({ useLayoutCache = true, data, layout, point, sizes = {} }) {
  // converts layout expression to a layout object
  if (typeof layout === "string") {
    layout = parse(layout, { useLayoutCache });
  }

  let parent;
  let index;
  let value = data;
  // dims are arrays
  const { dims } = layout;
  const len = dims.length;
  for (let idim = 0; idim < len; idim++) {
    const arr = dims[idim];
    if (arr.type === "Vector") {
      const i = point[arr.dim];
      parent = value;
      index = i;
      value = value[i];
    } else {
      // only 2 types so must be a Matrix
      const { parts } = arr;
      let offset = 0;
      let multiplier = 1;
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        if (part.type === "Vector") {
          const { dim } = part;
          offset += multiplier * point[dim];
          if (i > 0) {
            if (!(dim in sizes)) throw new Error(`you cannot calculate the location without knowing the size of the "${dim}" dimension.`);
            multiplier *= sizes[dim];
          }
        }
      }
      parent = value;
      index = offset;
      value = value[offset];
    }
  }

  return { index, value, parent };
}

// add dimension to an array until the limit reaches zero
function addDims({ arr, fill = undefined, lens }) {
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

// generates an in-memory data structure to hold the data
function prepareData({ fill = undefined, layout, useLayoutCache = true, sizes }) {
  if (typeof layout === "string") layout = parse(layout, { useLayoutCache });

  const shape = layout.dims.map(it => {
    if (it.type === "Vector") {
      return sizes[it.dim];
    } else if (it.type === "Matrix") {
      return it.parts.reduce((total, pt) => total * sizes[pt.dim], 1);
    }
  });

  const data = createMatrix({ fill, shape });

  return { data, shape };
}

function transform({ data, from, to, sizes, useLayoutCache = true }) {
  if (typeof from === "string") from = parse(from, { useLayoutCache });
  if (typeof to === "string") to = parse(to, { useLayoutCache });

  const { data: out_data } = prepareData({ layout: to, sizes });

  let points = [{}];
  for (let dim in sizes) {
    const len = sizes[dim];
    const newPoints = [];
    for (let i = 0; i < len; i++) {
      points.forEach(pt => {
        newPoints.push({ [dim]: i, ...pt });
      });
    }
    points = newPoints;
  }

  points.forEach(point => {
    const { value } = select({
      data,
      layout: from,
      point,
      sizes
    });

    // insert into new frame
    update({
      data: out_data,
      layout: to,
      point,
      sizes,
      value
    });
  });

  return { data: out_data };
}

module.exports = {
  checkValidity,
  createMatrix,
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  prepareData,
  removeBraces,
  removeParentheses,
  select,
  transform,
  update,
  clip
};
