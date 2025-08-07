import type { ICanSetArchitecture } from "./Rule";

export interface ICommand<TResult = void> extends ICanSetArchitecture {
  execute(): TResult;
}
