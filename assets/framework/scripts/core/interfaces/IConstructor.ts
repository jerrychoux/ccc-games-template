export interface IConstructable<T, P extends unknown[] = []> {
  new (...args: P): T;
}
