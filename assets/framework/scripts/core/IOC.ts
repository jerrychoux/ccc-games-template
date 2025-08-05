import { IConstructable } from "./interfaces/IConstructor";
import { Constructor } from "./types/Common";

export class IOCContainer {
  private readonly instances = new Map<IConstructable<unknown>, unknown>();

  register = <T extends object>(instance: T) =>
    this.instances.set(Object.getPrototypeOf(instance).constructor, instance);

  get = <T extends object>(ctor: Constructor<T>): T =>
    (this.instances.get(ctor) as T) ?? null;

  getInstancesBySymbol<T>(symbol: symbol): T[] {
    return Array.from(this.instances.entries())
      .filter(([ctor]) => (ctor as any)[symbol] === true)
      .map(([, instance]) => instance as T);
  }

  clear = () => this.instances.clear();
}
