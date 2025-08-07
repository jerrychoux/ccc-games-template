import type { ICanInit, ICanSetArchitecture } from "./Rule";

export const ModelSymbol = Symbol("Model");

export interface IModel extends ICanInit, ICanSetArchitecture {
  [ModelSymbol]: true;
}
