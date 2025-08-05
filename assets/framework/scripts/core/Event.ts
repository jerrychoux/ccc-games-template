import { IEvent } from "./interfaces/IEvent";
import { Constructor } from "./types/Common";

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
