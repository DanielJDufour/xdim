# multidimensional-functions
Functions for Working with Multi-Dimensional Data

# motivation
I work a lot with satellite imagery.  In theory, most satellite imagery has three dimensions: (1) band, like red, green, and blue; (2) row, and (3) column.  However, for practical reasons, this data is often structured in a flat array, like [ImageData.data](https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data) or a two-dimensional array where each subarray holds all the values for a specific band in [row-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order).  This library was created for two main purposes: (1) to provide a unified interface for querying this data regardless of its practical structure and (2) converting this data from different structural layouts.

# install
```bash
npm install multidimensional-functions
```

# usage
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