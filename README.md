# xdim
> Multi-Dimensional Functions

# motivation
I work a lot with satellite imagery.  In theory, most satellite imagery has three dimensions: (1) band, (2) row, and (3) column.  However, for practical reasons, this data is often structured in a flat array, like [ImageData.data](https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data) or a two-dimensional array where each subarray holds all the values for a specific band in [row-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order).  This library was created for two main purposes: (1) to provide a unified interface for querying this data regardless of its practical structure and (2) converting this data between different array layouts.

# install
```bash
npm install xdim
```

# xdim layout syntax
Most of the functions in this library require that you specify the layout of the data using <b>"xdim layout syntax"</b> or <b>"xdim syntax"</b> for short.  The format is simple with just a few main pieces:
1) The straight brackets `[` and `]` indicates an actual array or subarrays.
2) The comma `,` appears between `[` and `]` and means dimensions are interleaved in left-to-right major order.
3) Dimension names can be made of any letter A to Z, lowercased or uppercased, can include underscores, and don't include spaces.

### xdim layout syntax examples
Here's a couple examples of the <b>"xdim layout syntax"</b>:

#### example: cars
You have an array of information about car models where the information is stored in subarrays:
```js
[
  ["Fusion", "Ford", "United States", "2005", "2020"]
  ["Versa", "Nissan", "Japan", "2006", "2021"]
]
```
The layout could be described as `"[model][brand,maker,county,start_year,end_year]"`
  
#### example: pixels
You have [ImageData.data](https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data):
```js
[31, 9, 71, 255, 126, 42, 53, 255, 71, 74, 71, 255, ...]
```
The layout could be described as `"[row,column,band]"`.


# usage
This library provides the following functions: [select](#select), [clip](#clip), [transform](#transform), [prepareData](#prepareData), and [update](#update).

## select
Select is used to get the value at a given multi-dimensional point.  The point is an object where each key is the name of a dimension with an index number.  Index numbers start at zero and increase until we reach the end of the length in the dimension.

```javascript
import { select } from 'xdim';

// satellite imagery data broken down by band
const data = [
  [0, 123, 123, 162, ...], // red band
  [213, 41, 62, 124, ...], // green band
  [84, 52, 124, 235, ...] // blue band
];

const result = select({
  data,

  // each band is a separate array
  // the values in a band are in row-major order
  layout: "[band][row,column]",
  
  sizes: {
    band: 3, // image has 3 bands (red, green, and blue)
    column: 100 // image is 100 pixels wide
  },
 
  point: {
    band: 2, // 3rd band (blue), where band index starts at zero
    row: 74, // 73rd row from the top
    column: 63 // 62nd column from the left
  }
});
```
result is an object
```js
{
  // the actual value found in the array
  value: 62,

  // the index in the array where the value is found
  index: 7463,
  
  // a reference to the same array in the provided data
  parent: [84, 52, 124, 235, ... 62, ...]
}
```

## transform
If your data is a one dimensional array, you can transform to another using the transform function.
In the example below we transform from a flat array of [ImageData.data](https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data) to a truly 3-dimensional array of arrays of arrays representing bands, then rows, then columns.

```javascript
import { transform } from 'multdimensional-functions';

// an array of image data red, green, blue, alpha, red, green, blue, alpha,...
const data = [0, 213, 84, 255, 123, 41, 52, 255, 123, 62, 124, 255, 162, 124, 235, 255, ...];

const result = transform({
  data,
  from: "[row,column,band]", // starting layout where all in one row with row-major order and interleaved bands
  to: "[band][row][column]", // final layout where each dimension is represented by arrays or subarrays and there is no interleaving of numbers inside the arrays
  sizes: {
    band: 4, // red, green, blue and alpha
    row: 768,
    width: 1024
  }
});
```
result is an object
```js
{
  matrix: [
    // red band
    [
      [0, 123, 123, 162, ...] // first row of the red band
      [212, 124, 127, 92, ... ] // second row of the red band
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
```

## prepareData
If you just want to create the outline or skeleton of your structure without filling it in with data, you can call the prepareData function.
```js
import { prepareData } from 'xdim';

const result = prepareData({
  // the default fill value is undefined, but you can set it to zero, null, -99, an object, or really anything you want
  // in this example, the default fill value is the number -99
  fill: -99, 
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
      [-99, -99, ... ], // band's first row of columns with length being the number of columns
      [-99, -99, ... ], // band's second row
      .
      .
      .
    ],
    
    // second band
    [
      [-99, -99, ... ], // band's first row of columns with length being the number of columns
      [-99, -99, ... ], // band's second row
    ]
  ]
```

## update
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
});
```
