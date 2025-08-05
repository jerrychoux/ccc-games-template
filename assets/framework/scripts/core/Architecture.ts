import { IArchitecture } from "./interfaces/IArchitecture";
import { ICommand } from "./interfaces/ICommand";
import { IModel, ModelSymbol } from "./interfaces/IModel";
import { IQuery } from "./interfaces/IQuery";
import { ISystem, SystemSymbol } from "./interfaces/ISystem";
import { IUnRegisterList } from "./interfaces/ITypeEventSystem";
import { IUtility } from "./interfaces/IUtility";
import { IOCContainer } from "./IOC";
import { TypeEventSystem } from "./TypeEventSystem";
import { AbstractConstructor, Action, Constructor } from "./types/Common";

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
      .getInstances<IModel>(ModelSymbol)
      .filter((model) => !model.initialized)
      .forEach((model) => {
        model.init();
        model.initialized = true;
      });

    instance.container
      .getInstances<ISystem>(SystemSymbol)
      .filter((system) => !system.initialized)
      .forEach((system) => {
        system.init();
        system.initialized = true;
      });

    instance.inited = true;
    Architecture.instances.set(this, instance);
  }

  protected abstract init(): void;

  deinit(): void {
    this.onDeinit();

    this.container
      .getInstances<IModel>(ModelSymbol)
      .filter((model) => model.initialized)
      .forEach((model) => model.deinit());

    this.container
      .getInstances<ISystem>(SystemSymbol)
      .filter((system) => system.initialized)
      .forEach((system) => system.deinit());

    this.container.clear();
    Architecture.instances.delete(this.constructor as AbstractConstructor<any>);
  }

  protected onDeinit(): void {}

  private container = new IOCContainer();

  registerSystem(system: ISystem): void {
    system.setArchitecture(this);
    this.container.register(system);

    if (this.inited) {
      system.init();
      system.initialized = true;
    }
  }

  registerModel(model: IModel): void {
    model.setArchitecture(this);
    this.container.register(model);

    if (this.inited) {
      model.init();
      model.initialized = true;
    }
  }

  registerUtility(utility: IUtility): void {
    this.container.register(utility);
  }

  getSystem = <T extends ISystem>(ctor: Constructor<T>): T =>
    this.container.getInstance(ctor);

  getModel = <T extends IModel>(ctor: Constructor<T>): T =>
    this.container.getInstance(ctor);

  getUtility = <T extends IUtility>(ctor: Constructor<T>): T =>
    this.container.getInstance(ctor);

  protected executeCommand(command: ICommand) {
    command.setArchitecture(this);
    command.execute();
  }

  sendCommand<T extends ICommand>(command: T): void;
  sendCommand<T>(command: ICommand<T>): T;
  sendCommand<T>(command: ICommand<T>): void | T {
    this.executeCommand(command);
  }

  protected doQuery<T>(query: IQuery<T>) {
    query.setArchitecture(this);
    return query.do();
  }

  sendQuery<T>(query: IQuery<T>): T {
    return this.doQuery(query);
  }

  private typeEventSystem = new TypeEventSystem();

  sendEvent<T extends new (...args: any[]) => any>(): void;
  sendEvent<T>(event: T): void;
  sendEvent(event?: unknown): void {
    throw new Error("Method not implemented.");
  }
  // sendEvent<T>(ctor: Constructor<T>): void;
  // sendEvent<T>(event: T): void;
  // sendEvent(event?: unknown): void {
  //   throw new Error("Method not implemented.");
  // }
  registerEvent<T>(onEvent: Action<T>): IUnRegisterList {
    throw new Error("Method not implemented.");
  }
  unRegisterEvent<T>(onEvent: Action<T>): void {
    throw new Error("Method not implemented.");
  }
}
