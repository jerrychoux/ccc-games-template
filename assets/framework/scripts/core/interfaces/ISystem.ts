import { ICanInit, ICanSetArchitecture } from "./IRule";

export const SystemSymbol = Symbol("System");
export interface ISystem extends ICanInit, ICanSetArchitecture {
  [SystemSymbol]: true;
}
