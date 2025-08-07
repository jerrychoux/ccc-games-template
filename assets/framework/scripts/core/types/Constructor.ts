export type Constructor<T = unknown, P extends unknown[] = []> = new (
  ...args: P
) => T;

export type AbstractConstructor<
  T = unknown,
  P extends unknown[] = []
> = abstract new (...args: P) => T;

export type ConstructorParams<T> = T extends Constructor<unknown, infer P>
  ? P
  : never;

export type AbstractConstructorParams<T> = T extends AbstractConstructor<
  unknown,
  infer P
>
  ? P
  : never;
