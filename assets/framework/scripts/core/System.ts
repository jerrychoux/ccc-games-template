import type { ICanInit, ICanSetArchitecture } from "./Rule";

export const SystemSymbol = Symbol("System");

export interface ISystem extends ICanInit, ICanSetArchitecture {
  [SystemSymbol]: true;
}
