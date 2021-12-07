const test = require("flug");
const { prepareData, prepareSelect, select, update, prepareUpdate, transform } = require("../src/xdim");

const sizes = { a: 4, b: 1e3, c: 1e3 };
const layout = "[a][b][c]";
const { data } = prepareData({ fill: 0, layout, sizes });

const im_sizes = { band: 4, row: 1e3, column: 1e3 };
const im_layout = "[band][row,column]";
const { data: im_data } = prepareData({ fill: 0, layout: im_layout, sizes: im_sizes });

test("perf: select [a][b][c]", ({ eq }) => {
  console.time("perf: select [a][b][c]");
  for (let a = 0; a < sizes.a; a++) {
    for (let b = 0; b < sizes.b; b++) {
      for (let c = 0; c < sizes.c; c++) {
        select({ data, layout, point: { a, b, c }, sizes });
      }
    }
  }
  console.timeEnd("perf: select [a][b][c]");
});

test("perf: prepareSelect [a][b][c]", ({ eq }) => {
  console.time("perf: prepareSelect [a][b][c]");
  const select = prepareSelect({ data, layout, sizes });
  for (let a = 0; a < sizes.a; a++) {
    for (let b = 0; b < sizes.b; b++) {
      for (let c = 0; c < sizes.c; c++) {
        select({ point: { a, b, c } });
      }
    }
  }
  console.timeEnd("perf: prepareSelect [a][b][c]");
});

test("perf: select [band][row,column]", ({ eq }) => {
  console.time("perf: select [band][row,column]");
  for (let b = 0; b < im_sizes.band; b++) {
    for (let r = 0; r < im_sizes.row; r++) {
      for (let c = 0; c < im_sizes.column; c++) {
        select({ data: im_data, layout: im_layout, point: { band: b, row: r, column: c }, sizes: im_sizes });
      }
    }
  }
  console.timeEnd("perf: select [band][row,column]");
});

test("perf: prepareSelect [band][row,column]", ({ eq }) => {
  console.time("perf: prepareSelect [band][row,column]");
  const select = prepareSelect({ data: im_data, layout: im_layout, sizes: im_sizes });
  for (let b = 0; b < im_sizes.band; b++) {
    for (let r = 0; r < im_sizes.row; r++) {
      for (let c = 0; c < im_sizes.column; c++) {
        select({ point: { band: b, row: r, column: c } });
      }
    }
  }
  console.timeEnd("perf: prepareSelect [band][row,column]");
});

test("perf: update [band][row,column]", ({ eq }) => {
  console.time("perf: update [band][row,column]");
  for (let b = 0; b < im_sizes.band; b++) {
    for (let r = 0; r < im_sizes.row; r++) {
      for (let c = 0; c < im_sizes.column; c++) {
        update({ data: im_data, layout: im_layout, point: { band: b, row: r, column: c }, sizes: im_sizes, value: 10 });
      }
    }
  }
  console.timeEnd("perf: update [band][row,column]");
});

test("perf: prepareUpdate [band][row,column]", ({ eq }) => {
  console.time("perf: prepareUpdate [band][row,column]");
  const update = prepareUpdate({ data: im_data, layout: im_layout, sizes: im_sizes });
  for (let b = 0; b < im_sizes.band; b++) {
    for (let r = 0; r < im_sizes.row; r++) {
      for (let c = 0; c < im_sizes.column; c++) {
        update({ point: { band: b, row: r, column: c }, value: 10 });
      }
    }
  }
  console.timeEnd("perf: prepareUpdate [band][row,column]");
});

test("perf: transform [band][row,column] to [row,column,band]", ({ eq }) => {
  console.time("perf: transform [band][row,column] to [row,column,band]");
  transform({
    data,
    from: im_layout,
    to: "[row,column,band]",
    sizes: im_sizes
  });
  console.timeEnd("perf: transform [band][row,column] to [row,column,band]");
});
