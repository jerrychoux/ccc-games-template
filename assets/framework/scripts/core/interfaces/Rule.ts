export interface ICanInit {
  initialized: boolean;
  init(): void;
  deinit(): void;
}
