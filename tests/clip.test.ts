import test from "flug";
import { clip } from "../src/xdim";

test("clip [band][row][column]", ({ eq }) => {
  const data = [
    // red band
    [
      [0, 1],
      [2, 3]
    ],

    // green band
    [
      [4, 5],
      [6, 7]
    ],

    // blue band
    [
      [8, 9],
      [10, 11]
    ]
  ] as const;
  const layout = "[band][row][column]" as const;
  const result = clip({
    data,
    layout,
    sizes: {
      band: 3,
      row: 2,
      column: 2
    },

    // first row of the third band
    rect: {
      band: [2, 2],
      row: [0, 0], // first row
      column: [0, 1] // all columns
    }
  });
  eq(result.data, [[[8, 9]]]);
});

test("clip [band][row,column]", ({ eq }) => {
  const data = [
    [0, 1, 2, 3], // red
    [4, 5, 6, 7], // green
    [8, 9, 10, 11] // blue
  ];
  const layout = "[band][row,column]";
  const result = clip({
    data,
    layout,
    sizes: {
      band: 3,
      row: 2,
      column: 2
    },

    // first row of the third band
    rect: {
      band: [2, 2],
      row: [0, 0], // first row
      column: [0, 1] // all columns
    }
  });
  eq(result.data, [[8, 9]]);
});

test("clip rgb image data", ({ eq }) => {
  const data = [0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7, 11];
  const layout = "[row,column,band]";
  const result = clip({
    data,
    layout,
    sizes: {
      band: 3,
      row: 2,
      column: 2
    },

    // first row of the third band
    rect: {
      band: [2, 2],
      row: [0, 0], // first row
      column: [0, 1] // all columns
    }
  });
  eq(result.data, [8, 9]);
});

test("clip [band][row][column] flat", ({ eq }) => {
  const data = [
    // red band
    [
      [0, 1],
      [2, 3]
    ],

    // green band
    [
      [4, 5],
      [6, 7]
    ],

    // blue band
    [
      [8, 9],
      [10, 11]
    ]
  ];
  const layout = "[band][row][column]";
  const result = clip({
    data,
    flat: true,
    layout,
    sizes: {
      band: 3,
      row: 2,
      column: 2
    },

    // first row of the third band
    rect: {
      band: [2, 2],
      row: [0, 0], // first row
      column: [0, 1] // all columns
    }
  });
  eq(result.data, [8, 9]);
});
