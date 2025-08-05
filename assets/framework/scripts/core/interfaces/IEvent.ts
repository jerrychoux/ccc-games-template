import { Action } from "../types/Common";

export interface IUnRegister {
  unRegister(): void;
}

export interface IEvent {
  register(onEvent: Action): IUnRegister;
}
