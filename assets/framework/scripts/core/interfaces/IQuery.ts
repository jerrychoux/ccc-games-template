export interface IQuery<TResult = void> {
  do(): TResult;
}
