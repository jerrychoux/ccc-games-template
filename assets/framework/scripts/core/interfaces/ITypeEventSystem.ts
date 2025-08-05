export interface IUnRegister {
  unRegister(): void;
}

export interface IUnRegisterList {
  readonly unregisterList: IUnRegister[];
}
