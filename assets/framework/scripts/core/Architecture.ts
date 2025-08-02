import { IArchitecture } from "./interfaces/IArchitecture";
import { ICommand } from "./interfaces/ICommand";
import { IModel } from "./interfaces/IModel";
import { IQuery } from "./interfaces/IQuery";
import { ISystem } from "./interfaces/ISystem";
import { IUnRegisterList } from "./interfaces/ITypeEventSystem";
import { IUtility } from "./interfaces/IUtility";

export abstract class Architecture<T extends Architecture<T>>
  implements IArchitecture
{
  registerSystem<T>(system: T): ISystem {
    throw new Error("Method not implemented.");
  }
  registerModel<T>(model: T): IModel {
    throw new Error("Method not implemented.");
  }
  registerUtility<T>(utility: T): IUtility {
    throw new Error("Method not implemented.");
  }
  getSystem<T extends ISystem>(): T {
    throw new Error("Method not implemented.");
  }
  getModel<T extends IModel>(): T {
    throw new Error("Method not implemented.");
  }
  getUtility<T extends IUtility>(): T {
    throw new Error("Method not implemented.");
  }
  sendCommand<T extends ICommand>(command: T): void;
  sendCommand<TResult>(command: ICommand<TResult>): TResult;
  sendCommand<TResult>(command: unknown): void | TResult {
    throw new Error("Method not implemented.");
  }
  sendQuery<TResult>(query: IQuery<TResult>): TResult {
    throw new Error("Method not implemented.");
  }
  sendEvent<T extends new (...args: any[]) => any>(): void;
  sendEvent<T>(event: T): void;
  sendEvent(event?: unknown): void {
    throw new Error("Method not implemented.");
  }
  registerEvent<T>(onEvent: Action<T>): IUnRegisterList {
    throw new Error("Method not implemented.");
  }
  unRegisterEvent<T>(onEvent: Action<T>): void {
    throw new Error("Method not implemented.");
  }
  deinit(): void {
    throw new Error("Method not implemented.");
  }
}
