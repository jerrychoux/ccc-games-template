import { ICanInit } from "./Rule";

export const SystemSymbol = Symbol("System");
export interface ISystem extends ICanInit {
  [SystemSymbol]: true;
}
