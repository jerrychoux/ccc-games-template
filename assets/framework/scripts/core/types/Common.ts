import { IConstructable } from "../interfaces/IConstructor";

export type Action<T> = (event: T) => void;
export type Constructor<T> = new () => T;
export type AbstractConstructor<T> = abstract new () => T;
export type ParamConstructor<T, P extends any[] = []> = new (...args: P) => T;
export type ConstructorParams<T> = T extends IConstructable<any, infer P>
  ? P
  : never;
