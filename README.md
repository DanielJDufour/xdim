⚠️ This library is highly experimental.  Please test before using in production.

---

# multidimensional-functions
> Functions for Working with Multi-Dimensional Data

# motivation
I work a lot with satellite imagery.  In theory, most satellite imagery has three dimensions: (1) band, like red, green, and blue; (2) row, and (3) column.  However, for practical reasons, this data is often structured in a flat array, like [ImageData.data](https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data) or a two-dimensional array where each subarray holds all the values for a specific band in [row-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order).  This library was created for two main purposes: (1) to provide a unified interface for querying this data regardless of its practical structure and (2) converting this data between different structural layouts.

# install
```bash
npm install multidimensional-functions
```

# usage
## reading a data point
```javascript
import { select } from 'multidimensional-functions';

const data = [
  [0, 123, 123, 162, ...], // red band
  [213, 41, 62, 124, ...], // green band
  [84, 52, 124, 235, ...] // blue band
];

const result = select({
  data,
  layout: "[band][row,column]",
  sizes: {
    band: 3, // image has 3 bands (red, green, and blue)
    column: 100 // image is 100 pixels wide
  }
  point: {
    band: 2, // 3rd band (blue), where band index starts at zero
    row: 74, // 73rd row from the top
    column: 63 // 62nd column from the left
  }
});
// result is { value: 62 }
```

## layout transformations
If your data is a one dimensional array, you can transform to another using the transform function.
In the example below we transform from a flat array of [ImageData.data](https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data) to a truly 3-dimensional array of arrays of arrays representing bands, then rows, then columns.

```javascript
import { transform } from 'multdimensional-functions';

// an array of image data red, green, blue, alpha, red, green, blue, alpha,...
const data = [0, 213, 84, 255, 123, 41, 52, 255, 123, 62, 124, 255, 162, 124, 235, 255, ...];

const result = transform({
  data,
  from: "[row,column,band]", // starting layout where all in one row with row-major order and bands interleaved
  to: "[band][row][column]", // destination layout where each dimension are represented by arrays and not interleaved in the same array
  sizes: {
    band: 4, // red, green, blue and alpha
    row: 768,
    width: 1024
  }
});

/* result is 
{
  matrix: [
    // red band
    [
      [0, 123, 123, 162, ...] // first row of the red band
      [212, ... ] // second row the red band
    ],

    // green band
    [
      [ ... ],
      [ ... ]
    ],

    // blue band
    [
      [ ... ],
      [ ... ]
    ],

    // alpha band
    [
      [ ... ],
      [ ... ]
    ]
  ]
}
*/
```

## constructing empty data structure
If you just want to create the outline or skeleton of your structure without filling it in with data, you can call the prep function.
```js
import { prep } from 'xdim';

const result = prep({
  debugLevel: 0, // set to 1 or higher for increased logging
  fill: undefined, // the default fill value, could be set to zero, -99 or anything you want
  layout: "[band][row][column]",
  sizes: {
    band: 4,
    column: 1024,
    row: 768
  }
});
```
result is an object with an empty matrix and shape
```
{
  shape: [4, 768, 1024], // describes the actual length of each array
  matrix: [
    // first band
    [
      [undefined, undefined, ... ], // band's first row of columns with length being the number of columns
      [undefined, undefined, ... ], // band's second row
      .
      .
      .
    ],
    
    // second band
    [
      [undefined, undefined, ... ], // band's first row of columns with length being the number of columns
      [undefined, undefined, ... ], // band's second row
    ]
  ]
```

## inserting or updating a value
If you have a multi-dimensional data structure and want to change or add a value, use `update`.
```js
import { update } from 'xdim';

// an image in RGBA Image Data Format
const data = [128, 31, 382, 255, 48, 38, 58, 255, ...];

update({
  // the structure that we will be modifying with a new value
  data,
 
  // controls logging for debugging purposes
  // set to 1 or higher for increased logging
  debugLevel: 0,
  
  // layout describing one array in major order from row to column to band
  layout: "[row,column,band]",

  // a point in multi-dimensional space
  point: {
    band: 2, // third-band or blue
    row: 4, // the 5th row
    column: 8, // the 9th column
  },
 
  sizes: {
    band: 4, // the 4 bands: red, green, blue and alpha
    row: 768, // the number of rows or height of the image
    column: 1024, // the number of columns or width of the image
  },
 
  // the value to insert at the specified point
  // it doesn't have to be a number
  value: 128 
})
```
