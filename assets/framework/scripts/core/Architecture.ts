import type { AbstractConstructor, Action, Constructor } from "./Common";
import type { ICommand } from "./Command";
import type { IUtility } from "./Utility";
import type { IQuery } from "./Query";
import type { IUnRegisterList } from "./Event";
import { SystemSymbol, type ISystem } from "./System";
import { ModelSymbol, type IModel } from "./Model";
import { IOCContainer } from "./IOC";

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
