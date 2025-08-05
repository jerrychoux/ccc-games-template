import { Action, Constructor } from "../types/Common";
import { ICommand } from "./ICommand";
import { IModel } from "./IModel";
import { IQuery } from "./IQuery";
import { ISystem } from "./ISystem";
import { IUnRegisterList } from "./ITypeEventSystem";
import { IUtility } from "./IUtility";

export interface IArchitecture {
  registerSystem(system: ISystem): void;
  registerModel(model: IModel): void;
  registerUtility(utility: IUtility): void;

  getSystem<T extends ISystem>(ctor: Constructor<T>): T;
  getModel<T extends IModel>(ctor: Constructor<T>): T;
  getUtility<T extends IUtility>(ctor: Constructor<T>): T;

  sendCommand<T extends ICommand>(command: T): void;
  sendCommand<T>(command: ICommand<T>): T;
  sendQuery<T>(query: IQuery<T>): T;
  sendEvent<T extends new (...args: any[]) => any>(): void;
  sendEvent<T>(event: T): void;

  registerEvent<T>(onEvent: Action<T>): IUnRegisterList;
  unRegisterEvent<T>(onEvent: Action<T>): void;

  deinit(): void;
}
