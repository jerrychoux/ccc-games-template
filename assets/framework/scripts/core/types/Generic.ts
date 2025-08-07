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

export type Nullable<T> = T | null;
export type Action<T = void> = (arg: T) => void;
export type AsyncAction<T = void> = (arg: T) => Promise<void>;
export type Func<T = void, R = void> = (arg: T) => R;
export type AsyncFunc<T = void, R = void> = (arg: T) => Promise<R>;
