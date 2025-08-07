import { Action, Constructor } from "./Common";
import { List } from "linq-collections";

export interface IUnRegister {
  unRegister(): void;
}

export interface IUnRegisterList {
  readonly unRegisterList: List<IUnRegister>;
}

export function addToUnRegisterList(unReg: IUnRegister, list: IUnRegisterList) {
  list.unRegisterList.push(unReg);
}

export function UnRegisterAll(list: IUnRegisterList) {
  list.unRegisterList.forEach((value) => value.unRegister());
  list.unRegisterList.clear();
}

export interface IEvent {
  register(onEvent: Action): IUnRegister;
}

export class Event implements IEvent {
  private handles = new Set<Action>();
  register(onEvent: Action): IUnRegister {
    this.handles.add(onEvent);
    return new CustomUnRegister(() => this.unRegister(onEvent));
  }
  unRegister(onEvent: Action) {
    this.handles.delete(onEvent);
  }
}

export class Events {
  private static readonly globalEvents = new Events();
  private events = new Map<Constructor, IEvent>();

  addEvent = <T extends IEvent>(ctor: Constructor<T>) =>
    this.events.set(ctor, new ctor() as T);

  getEvent = <T extends IEvent>(ctor: Constructor<T>): T =>
    (this.events.get(ctor) as T) ?? null;

  getOrAddEvent<T extends IEvent>(ctor: Constructor<T>): T {
    let event = this.getEvent(ctor);

    if (!event) {
      event = new ctor() as T;
      this.events.set(ctor, event);
    }

    return event;
  }
}

// class AdvancedEasyEvents {
//   private static instance: AdvancedEasyEvents;
//   private events = new Map<string, IEasyEvent>();

//   private constructor() {}

//   public static getInstance(): AdvancedEasyEvents {
//     if (!AdvancedEasyEvents.instance) {
//       AdvancedEasyEvents.instance = new AdvancedEasyEvents();
//     }
//     return AdvancedEasyEvents.instance;
//   }

//   public register<T extends IEasyEvent>(key: string, creator: () => T): void {
//     if (!this.events.has(key)) {
//       this.events.set(key, creator());
//     }
//   }

//   public get<T extends IEasyEvent>(key: string): T | undefined {
//     return this.events.get(key) as T | undefined;
//   }

//   public getOrCreate<T extends IEasyEvent>(key: string, creator: () => T): T {
//     if (!this.events.has(key)) {
//       this.register(key, creator);
//     }
//     return this.get(key) as T;
//   }
// }
