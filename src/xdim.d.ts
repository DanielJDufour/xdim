// export type data = Array<data | number | string>;
// export type ReadOnlyData = Readonly<data>;
import type {
  MultidimensionalArray,
  ReadonlyTuple,
  Replace
} from "type-fest";

// width modification from https://dev.to/tylim88/typescript-count-substring-of-a-string-literal-type-536b
// prettier-ignore
type Count<
  str extends string,
  substr extends string,
  C extends unknown[] = []
> = str extends `${string}${substr}${infer Tail}`
  ? Count<Tail, substr, [1, ...C]>
  : C['length'];

type NDIMS<layout extends string> = Count<layout, "[">;

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

export type ArrayTypeString = "Array" | "Int8Array" | "Uint8Array" | "Uint8ClampedArray" | "Int16Array" | "Uint16Array" | "Float32Array" | "Float64Array" | "BigInt64Array" | "BigUint64Array";
export type ArrayTypeStrings = ReadonlyArray<ArrayTypeString>;

export function addDims<A extends Array<any>>({ arr, fill, lens, arrayTypes }: {
  arr: A,
  fill?: undefined | number | string,
  lens?: number[],
  arrayTypes?: ArrayTypeStrings
}): A;

export function checkValidity(layout: string): true;

export function createMatrix<S extends Readonly<number[]>, F = undefined>({ fill, shape, arrayTypes }: { fill?: F; shape: S, arrayTypes?: ArrayTypeString[] | Readonly<Array<ArrayTypeString>> }): MultidimensionalArray<F, S["length"]>;

export function iterClip<D>({
  data,
  layout,
  order,
  rect,
  sizes,
  useLayoutCache
}: {
  data: D;
  layout: string;
  order?: string[];
  rect: Rect;
  sizes: Sizes;
  useLayoutCache?: boolean;
}): NumberIterator;

export function iterRange({ start, end }: { start?: number; end?: number }): NumberIterator;

export function iterPoints({ order, sizes, rect }: { order?: string[]; sizes: Sizes; rect?: Rect }): NumberIterator;

export function matchSequences(string: string): string[];

export function parse(
  string: string,
  { useLayoutCache }?: { useLayoutCache: boolean }
): {
  type: "Layout";
  summary: number[];
  dims: (Matrix | Vector)[];
};

export function parseDimensions(
  string: string
): {
  [dim: string]: {
    name: string;
  };
};
export function parseSequences(string: string): Matrix | Vector;
export function parseVectors(string: string): string[];
export function prepareData<
  L extends Readonly<string>,
  S extends ReadonlyTuple<number, NDIMS<L>>,
  F = undefined
>({
  fill,
  layout,
  useLayoutCache,
  sizes,
  arrayTypes
}: {
  fill?: F | undefined;
  layout: L;
  useLayoutCache?: boolean;
  sizes: Sizes;
  arrayTypes?: ArrayTypeStrings;
}): {
  shape: S,
  data: ReturnType<typeof createMatrix<S, F>>,
  arrayTypes: ArrayTypeStrings
}

export function prepareSelect<D>({
  useLayoutCache,
  data,
  layout,
  sizes
}: {
  useLayoutCache?: boolean;
  data: D;
  layout: string;
  sizes: Sizes;
}): ({ point }: { point: Point }) => Selection;

export function prepareUpdate<D>({
  useLayoutCache,
  data,
  layout,
  sizes
}: {
  useLayoutCache?: boolean;
  data: D;
  layout: string;
  sizes: Sizes;
}): ({ point, value }: { point: Point; value: number }) => void;
export function removeBraces<S extends string>(string: S): Replace<Replace<S, "[", "">, "]", "">;
export function removeParentheses<S extends string>(string: S): Replace<Replace<S, "(", "">, ")", "">;

export function select<D>({
  useLayoutCache,
  data,
  layout,
  point,
  sizes
}: {
  useLayoutCache?: boolean;
  data: D;
  layout: string;
  point: Point;
  sizes?: Sizes;
}): Selection;

export function transform<DATA_IN, DATA_OUT, L extends string>({
  data,
  fill,
  from,
  to,
  sizes,
  useLayoutCache
}: {
  data: DATA_IN;
  fill?: number;
  from: string;
  to: L;
  sizes: Sizes;
  useLayoutCache?: boolean;
}): {
  data: MultidimensionalArray<number, NDIMS<L>>
 };

export function update<D>({
  useLayoutCache,
  data,
  layout,
  point,
  sizes,
  value
}: {
  useLayoutCache?: boolean;
  data: D;
  layout: string;
  point: Point;
  sizes: Sizes;
  value: number;
}): void;

export function clip<D, L extends string, F extends boolean = false>({
  useLayoutCache,
  data,
  layout,
  rect,
  sizes,
  flat,
  validate
}: {
  useLayoutCache?: boolean;
  data: D;
  layout: L;
  rect: Rect;
  sizes: Sizes;
  flat?: F;
  validate?: boolean;
}): {
  data: F extends true ? number[] : MultidimensionalArray<number, NDIMS<L>>
};

export function validateRect({ rect }: { rect: Rect }): void;
