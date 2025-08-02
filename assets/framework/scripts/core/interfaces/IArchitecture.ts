import { ICommand } from "./ICommand";
import { IModel } from "./IModel";
import { IQuery } from "./IQuery";
import { ISystem } from "./ISystem";
import { IUnRegisterList } from "./ITypeEventSystem";
import { IUtility } from "./IUtility";

export interface IArchitecture {
  registerSystem<T>(system: T): ISystem;
  registerModel<T>(model: T): IModel;
  registerUtility<T>(utility: T): IUtility;

  getSystem<T extends ISystem>(): T;
  getModel<T extends IModel>(): T;
  getUtility<T extends IUtility>(): T;

  sendCommand<T extends ICommand>(command: T): void;
  sendCommand<TResult>(command: ICommand<TResult>): TResult;
  sendQuery<TResult>(query: IQuery<TResult>): TResult;
  sendEvent<T extends new (...args: any[]) => any>(): void;
  sendEvent<T>(event: T): void;

  registerEvent<T>(onEvent: Action<T>): IUnRegisterList;
  unRegisterEvent<T>(onEvent: Action<T>): void;

  deinit(): void;
}
