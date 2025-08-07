export type Dynamic = any;
export type Type =
  | "string"
  | "number"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "bigint";
export type Indexer = number | string;
export type Primitive = number | string | boolean;
export type Selector<TElement, TOut> = (element: TElement) => TOut;
export type ZipSelector<TElement, TOther, TOut> = (
  first: TElement,
  second: TOther
) => TOut;
export type Predicate<TElement> = Selector<TElement, boolean>;
export type Aggregator<TElement, TValue> = (
  previous: TValue,
  current: TElement
) => TValue;
export type Action<TElement> = (element: TElement, index: number) => void;
export type Func<T = void, R = void> = (arg: T) => R;
