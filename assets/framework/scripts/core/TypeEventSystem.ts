import { IUnRegister } from "./interfaces/ITypeEventSystem";

export class CustomUnRegister implements IUnRegister {
  unRegister(): void {
    throw new Error("Method not implemented.");
  }
}

export class TypeEventSystem {
  // private readonly
}
