export interface IReadOnlyList<TElement> extends IQueryable<TElement> {
  copy(): IList<TElement>;

  get(index: number): TElement | undefined;

  indexOf(element: TElement): number;
}

export interface IList<TElement> {
  asReadOnly(): IReadOnlyList<TElement>;
  asArray(): TElement[];
  add(element: TElement): number;
  addRange(): number;
  remove(element: TElement): void;
}
