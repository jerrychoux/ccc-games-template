export interface ICommand<TResult = void> {
  execute(): TResult;
}
