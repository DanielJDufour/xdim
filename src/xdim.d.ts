// export type data = Array<data>[];

// export type data<T> = T extends number[] ? number[] : Array<T>[];

// export type data<depth> = depth extends 1 ? number[] : data<(depth - 1)>;
// export type data = number[] | number[][] | number[][][] | number[][][][];

export type data = any[];

// interface Iterable<T> {
//   [Symbol.iterator](): Iterator<T>;

// }

// type NumberIterator = {
//   [Symbol.iterator](): NumberIterator;
//   next: () => { value: number, done: boolean };
// };

type NumberIterator = {
  [Symbol.iterator](): NumberIterator;
  next: () => { value: number; done: boolean };
};

export type Point = {
  [dim: string]: number;
};

export type Rect = {
  [dim: string]: [number, number] | number[];
};

export type Selection = {
  value: number;
  index: number;
  parent: number[];
};

export type Sizes = {
  [dim: string]: number;
};

export type Vector = {
  type: "Vector";
  dims: string[];
};

export type Matrix = {
  type: "Matrix";
  parts: (Vector | Matrix)[];
};

export function checkValidity(layout: string): true;

export function createMatrix({ fill, shape }: { fill?: number; shape: number[] }): data;

export function iterClip({
  data,
  layout,
  order,
  rect,
  sizes,
  useLayoutCache
}: {
  data: data;
  layout: string;
  order?: string[];
  rect: Rect;
  sizes: Sizes;
  useLayoutCache?: boolean;
}): NumberIterator;

export function iterRange({ start, end }: { start?: number; end?: number }): NumberIterator;

export function iterPoints({ order, sizes, rect }: { order?: string[]; sizes: Sizes; rect?: Rect }): NumberIterator;

export function matchSequences(string): string[];

export function parse(
  string,
  { useLayoutCache }?: { useLayoutCache: boolean }
): {
  type: "Layout";
  summary: number[];
  dims: (Matrix | Vector)[];
};

export function parseDimensions(string): {
  [dim: string]: {
    name: string;
  };
};
export function parseSequences(string: string): Matrix | Vector;
export function parseVectors(string: string): string[];
export function prepareData({ fill, layout, useLayoutCache, sizes }: { fill?: number; layout?: string; useLayoutCache?: boolean; sizes: Sizes }): {
  shape: number[];
  data: data;
};
export function prepareSelect({
  useLayoutCache,
  data,
  layout,
  sizes
}: {
  useLayoutCache?: boolean;
  data: data;
  layout: string;
  sizes: Sizes;
}): ({ point }: { point: Point }) => Selection;
export function prepareUpdate({
  useLayoutCache,
  data,
  layout,
  sizes
}: {
  useLayoutCache?: boolean;
  data: data;
  layout: string;
  sizes: Sizes;
}): ({ point, value }: { point: Point; value: number }) => void;
export function removeBraces(string: string): string;
export function removeParentheses(string: string): string;

export function select({
  useLayoutCache,
  data,
  layout,
  point,
  sizes
}: {
  useLayoutCache?: boolean;
  data: data;
  layout: string;
  point: Point;
  sizes?: Sizes;
}): Selection;

export function transform({
  data,
  fill,
  from,
  to,
  sizes,
  useLayoutCache
}: {
  data: data;
  fill?: number;
  from: string;
  to: string;
  sizes: Sizes;
  useLayoutCache?: boolean;
}): { data };

export function update({
  useLayoutCache,
  data,
  layout,
  point,
  sizes,
  value
}: {
  useLayoutCache?: boolean;
  data: data;
  layout: string;
  point: Point;
  sizes: Sizes;
  value: number;
}): void;

export function clip({
  useLayoutCache,
  data,
  layout,
  rect,
  sizes,
  flat,
  validate
}: {
  useLayoutCache?: boolean;
  data: data;
  layout: string;
  rect: Rect;
  sizes: Sizes;
  flat?: boolean;
  validate?: boolean;
}): { data: data };

export function validateRect({ rect }: { rect: Rect }): void;
