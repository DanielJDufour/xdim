const layoutCache = {};
const { wrapNextFunction } = require("iter-fun");
const preparedSelectFunctions = require("./prepared-select-funcs.js");
const preparedUpdateFunctions = require("./prepared-update-funcs.js");

const ARRAY_TYPES = {
  Array,
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Float32Array,
  Float64Array
};

try {
  ARRAY_TYPES.BigInt64Array = BigInt64Array;
  ARRAY_TYPES.BigUint64Array = BigUint64Array;
} catch (error) {
  // pass
}

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

function normalizeLayoutString(str) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let i = 0;
  return str.replace(/[A-Za-z]+/g, () => alphabet[i++]);
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
  const dims = vectors.map(parseSequences);
  const result = {
    type: "Layout",
    summary: dims.map(it => (it.type === "Matrix" ? it.parts.length : 1)),
    dims
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

function prepareUpdate({ useLayoutCache = true, data, layout, sizes = {} }) {
  if (typeof layout === "string") {
    layout = parse(layout, { useLayoutCache });
  }
  const { dims } = layout;
  const numDims = dims.length;
  const multipliers = getMultipliers({ useLayoutCache, layout, sizes });
  const end = numDims - 1;

  const key = layout.summary.toString();
  if (key in preparedUpdateFunctions) {
    const _this = { data };
    layout.dims.map((it, depth) => {
      if (it.type === "Vector") {
        _this[`d${depth}v0`] = it.dim;
      } else if (it.type === "Matrix") {
        it.parts.forEach((part, ipart) => {
          _this[`d${depth}v${ipart}`] = part.dim;
          _this[`m${depth}v${ipart}`] = multipliers[part.dim];
        });
      }
    });

    return preparedUpdateFunctions[key].bind(_this);
  }

  return ({ point, value }) => {
    let currentData = data;
    for (let idim = 0; idim < numDims; idim++) {
      const last = idim === end;
      const arr = dims[idim];
      let offset;
      if (arr.type === "Vector") {
        offset = point[arr.dim];
      } else {
        // arr.type assumed to be "Matrix"
        offset = arr.parts.reduce((acc, { dim }) => acc + multipliers[dim] * point[dim], 0);
      }
      if (last) {
        currentData[offset] = value;
      } else {
        currentData = currentData[offset];
      }
    }
  };
}

function iterClip({ data, layout, order, rect = {}, sizes = {}, useLayoutCache = true }) {
  if (!data) throw new Error("[xdim] must specify data");
  if (!layout) throw new Error("[xdim] must specify layout");
  const points = iterPoints({ order, sizes, rect });
  return wrapNextFunction(function next() {
    const { value: point, done } = points.next();
    if (done) {
      return { done: true };
    } else {
      const { value } = select({ data, layout, point, sizes, useLayoutCache });
      return { done: false, value };
    }
  });
}

function validateRect({ rect = {} }) {
  if (rect) {
    for (let key in rect) {
      const value = rect[key];
      if (value.length !== 2) throw new Error(`[xdim] uh oh. invalid hyper-rectangle`);
      const [start, end] = value;
      if (start > end) throw new Error(`[xdim] uh oh. invalid range for "${key}".  Start of ${start} can't be greater than end of ${end}.`);
      if (start < 0) throw new Error(`[xdim] uh oh. invalid hyper-rectangle with start ${start}`);
    }
  }
}

function clip({ useLayoutCache = true, data, layout, rect, sizes = {}, flat = false, validate = true }) {
  if (validate) validateRect({ rect });

  if (typeof layout === "string") layout = parse(layout, { useLayoutCache });

  let datas = [data];

  layout.dims.forEach(arr => {
    let new_datas = [];
    datas.forEach(data => {
      if (arr.type === "Vector") {
        const [start, end] = rect[arr.dim];
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
          const [start, end] = rect[dim];
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

  if (flat) {
    return {
      data: datas
    };
  }

  // prepareResult
  const out_sizes = Object.fromEntries(Object.entries(rect).map(([dim, [start, end]]) => [dim, end - start + 1]));

  const { data: out_data } = prepareData({
    layout,
    sizes: out_sizes
  });

  const max_depth = layout.dims.length;

  const step = (arr, depth) => {
    if (depth === max_depth) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = datas.shift();
      }
    } else {
      arr.forEach(sub => step(sub, depth + 1));
    }
  };
  step(out_data, 1);

  return { data: out_data };
}

function getMultipliers({ useLayoutCache = true, layout, sizes }) {
  if (typeof layout === "string") {
    layout = parse(layout, { useLayoutCache });
  }
  const { dims } = layout;
  const numDims = dims.length;
  let multipliers = {};
  for (let idim = 0; idim < numDims; idim++) {
    const arr = dims[idim];
    if (arr.type === "Vector") {
      multipliers[arr.dim] = 1;
    } else {
      // arr.type assumed to be "Matrix"
      const { parts } = arr;
      let multiplier = 1;
      for (let i = parts.length - 1; i >= 0; i--) {
        const { dim } = parts[i];
        multipliers[dim] = multiplier;
        multiplier *= sizes[parts[i].dim];
      }
    }
  }
  return multipliers;
}

function prepareSelect({ useLayoutCache = true, data, layout, sizes = {} }) {
  if (typeof layout === "string") {
    layout = parse(layout, { useLayoutCache });
  }
  const { dims } = layout;
  const numDims = dims.length;
  const multipliers = getMultipliers({ useLayoutCache, layout, sizes });
  const end = numDims - 1;

  const key = layout.summary.toString();
  if (key in preparedSelectFunctions) {
    const _this = { data };
    layout.dims.map((it, depth) => {
      if (it.type === "Vector") {
        _this[`d${depth}v0`] = it.dim;
      } else if (it.type === "Matrix") {
        it.parts.forEach((part, ipart) => {
          _this[`d${depth}v${ipart}`] = part.dim;
          _this[`m${depth}v${ipart}`] = multipliers[part.dim];
        });
      }
    });

    return preparedSelectFunctions[key].bind(_this);
  }

  return ({ point }) => {
    let currentData = data;
    for (let idim = 0; idim < numDims; idim++) {
      const last = idim === end;
      const arr = dims[idim];
      let offset;
      if (arr.type === "Vector") {
        offset = point[arr.dim];
      } else {
        // arr.type assumed to be "Matrix"
        offset = arr.parts.reduce((acc, { dim }) => acc + multipliers[dim] * point[dim], 0);
      }
      if (last) {
        return {
          index: offset,
          parent: currentData,
          value: currentData[offset]
        };
      } else {
        currentData = currentData[offset];
      }
    }
  };
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

// add dimensions to an array until the limit reaches zero
function addDims({ arr, fill = undefined, lens, arrayTypes }) {
  // no new dimensions to add
  if (lens.length === 0) return arr;

  const len = lens[0];
  if (lens.length === 1) {
    const lastArrayType = arrayTypes ? arrayTypes[arrayTypes.length - 1] : "Array";
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new ARRAY_TYPES[lastArrayType](len).fill(fill);
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const sub = new Array(len).fill(fill);
      arr[i] = sub;
      addDims({ arr: sub, fill, lens: lens.slice(1), arrayTypes });
    }
  }
  return arr;
}

// to-do: maybe only call fill if not undefined or default typed array value?
function createMatrix({ fill = undefined, shape, arrayTypes }) {
  const len = shape[0];
  if (shape.length === 1) {
    if (Array.isArray(arrayTypes) && arrayTypes.length !== 1) throw new Error("[xdim] shape and arrayTypes have different lengths");
    const arrayType = Array.isArray(arrayTypes) ? arrayTypes[0] : "Array";
    return new ARRAY_TYPES[arrayType](len).fill(fill);
  }
  const arr = new Array(len).fill(fill);
  return addDims({ arr, fill, lens: shape.slice(1), arrayTypes });
}

// generates an in-memory data structure to hold the data
function prepareData({ fill = undefined, layout, useLayoutCache = true, sizes, arrayTypes }) {
  if (typeof layout === "string") layout = parse(layout, { useLayoutCache });

  // console.log("layout:", layout);
  const shape = layout.dims.map(it => {
    if (it.type === "Vector") {
      return sizes[it.dim];
    } else if (it.type === "Matrix") {
      return it.parts.reduce((total, part) => {
        if (!(part.dim in sizes)) throw new Error(`[xdim] could not find "${part.dim}" in sizes: { ${Object.keys(sizes).join(", ")} }`);
        return total * sizes[part.dim];
      }, 1);
    }
  });

  const data = createMatrix({ fill, shape, arrayTypes });

  return { data, shape, arrayTypes };
}

// assume positive step
function iterRange({ start = 0, end = 100 }) {
  let i = start - 1;
  end = end + 1;
  return wrapNextFunction(function next() {
    i++;
    if (i === end) {
      return { done: true };
    } else {
      return { done: false, value: i };
    }
  });
}

// iterate over all the points, saving memory vs array
function iterPoints({ order, sizes, rect = {} }) {
  // names sorted by shortest dimension to longest dimension
  const names = Array.isArray(order) ? order : Object.keys(sizes).sort((a, b) => sizes[a] - sizes[b]);

  const iters = new Array(names.length);
  const current = {};
  for (let i = 0; i < names.length - 1; i++) {
    const name = names[i];
    const [start, end] = rect[name] || [0, sizes[name] - 1];
    iters[i] = iterRange({ start: start + 1, end });
    current[name] = start;
  }
  const lastName = names[names.length - 1];
  const [start, end] = rect[lastName] || [0, sizes[lastName] - 1];
  iters[iters.length - 1] = iterRange({ start: start, end });
  current[lastName] = start - 1;

  // permutate
  return wrapNextFunction(function next() {
    for (let i = iters.length - 1; i >= 0; i--) {
      const { value, done } = iters[i].next();

      if (done) {
        if (i === 0) {
          // we have exhausted all of the permutations
          return { done: true };
        }
      } else {
        // add iters for the remaining dims
        for (let ii = i + 1; ii < iters.length; ii++) {
          const nameii = names[ii];
          const [start, end] = rect[nameii] || [0, sizes[nameii] - 1];
          iters[ii] = iterRange({ start: start + 1, end });
          current[nameii] = start;
        }

        current[names[i]] = value;

        return { value: current, done: false };
      }
    }
  });
}

function transform({ data, fill = undefined, from, to, sizes, useLayoutCache = true }) {
  if (typeof from === "string") from = parse(from, { useLayoutCache });
  if (typeof to === "string") to = parse(to, { useLayoutCache });

  const { data: out_data } = prepareData({ fill, layout: to, sizes });

  const update = prepareUpdate({
    useLayoutCache,
    data: out_data,
    layout: to,
    sizes
  });

  const points = iterPoints({ sizes });

  for (point of points) {
    const { value } = select({
      data,
      layout: from,
      point,
      sizes
    });

    // insert into new frame
    update({
      point,
      value
    });
  }

  return { data: out_data };
}

module.exports = {
  addDims,
  checkValidity,
  createMatrix,
  iterClip,
  iterRange,
  iterPoints,
  matchSequences,
  parse,
  parseDimensions,
  parseSequences,
  parseVectors,
  prepareData,
  prepareSelect,
  prepareUpdate,
  removeBraces,
  removeParentheses,
  select,
  transform,
  update,
  clip,
  validateRect
};
