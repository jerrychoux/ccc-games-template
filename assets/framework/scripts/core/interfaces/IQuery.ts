import { ICanSetArchitecture } from "./IRule";

export interface IQuery<TResult = void> extends ICanSetArchitecture {
  do(): TResult;
}
