import { ICanInit, ICanSetArchitecture } from "./IRule";

export const ModelSymbol = Symbol("Model");
export interface IModel extends ICanInit, ICanSetArchitecture {
  [ModelSymbol]: true;
}
