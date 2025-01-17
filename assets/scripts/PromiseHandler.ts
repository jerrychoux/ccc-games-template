export interface PromiseHandler<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: any) => void;
}
