import { IConstructable } from "../interfaces/IConstructor";

export type Action<T = void> = (arg: T) => void;
export type AsyncAction<T = void> = (arg: T) => Promise<void>;
export type Func<T = void, R = void> = (arg: T) => R;
export type AsyncFunc<T = void, R = void> = (arg: T) => Promise<R>;
export type Constructor<T = unknown> = new () => T;
export type AbstractConstructor<T = unknown> = abstract new () => T;
export type ParamConstructor<T, P extends any[] = []> = new (...args: P) => T;
export type ConstructorParams<T> = T extends IConstructable<unknown, infer P>
  ? P
  : never;
