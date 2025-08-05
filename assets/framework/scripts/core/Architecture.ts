import { IArchitecture } from "./interfaces/IArchitecture";
import { ICommand } from "./interfaces/ICommand";
import { IConstructable } from "./interfaces/IConstructor";
import { IModel, ModelSymbol } from "./interfaces/IModel";
import { IQuery } from "./interfaces/IQuery";
import { ISystem, SystemSymbol } from "./interfaces/ISystem";
import { IUnRegisterList } from "./interfaces/ITypeEventSystem";
import { IUtility } from "./interfaces/IUtility";
import { IOCContainer } from "./IOC";
import { AbstractConstructor, Action } from "./types/Common";

export abstract class Architecture<T extends Architecture<T>>
  implements IArchitecture
{
  private inited = false;

  static onRegisterPatch?: <T extends Architecture<T>>(instance: T) => void;

  protected static readonly instances = new Map<
    AbstractConstructor<any>,
    Architecture<any>
  >();

  static get interface(): IArchitecture {
    if (!this.instances.has(this)) this.initArchitecture();
    return this.instances.get(this)!;
  }

  protected static initArchitecture<C extends Architecture<C>>(
    this: AbstractConstructor<C>
  ): void {
    // @ts-expect-error
    const instance = new this() as C;
    instance.init();

    Architecture.onRegisterPatch?.(instance);

    instance.container
      .getInstancesBySymbol<IModel>(ModelSymbol)
      .filter((model) => !model.initialized)
      .forEach((model) => {
        model.init();
        model.initialized = true;
      });

    instance.container
      .getInstancesBySymbol<ISystem>(SystemSymbol)
      .filter((system) => !system.initialized)
      .forEach((system) => {
        system.init();
        system.initialized = true;
      });

    instance.inited = true;
    Architecture.instances.set(this, instance);
  }

  protected abstract init(): void;

  protected onDeinit(): void {}

  private container = new IOCContainer();

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
