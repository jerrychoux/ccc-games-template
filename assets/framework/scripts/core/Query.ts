import type { ICanSetArchitecture } from "./Rule";

export interface IQuery<TResult = void> extends ICanSetArchitecture {
  do(): TResult;
}
