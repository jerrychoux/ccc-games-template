import { ICanSetArchitecture } from "./IRule";

export interface ICommand<TResult = void> extends ICanSetArchitecture {
  execute(): TResult;
}
