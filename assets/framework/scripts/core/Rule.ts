import type { IArchitecture } from "./Architecture";

export interface ICanInit {
  initialized: boolean;
  init(): void;
  deinit(): void;
}

export interface ICanSetArchitecture {
  setArchitecture(architecture: IArchitecture): void;
}
