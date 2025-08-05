import { ICanInit } from "./Rule";

export const ModelSymbol = Symbol("Model");
export interface IModel extends ICanInit {
  [ModelSymbol]: true;
}
