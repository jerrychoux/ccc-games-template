export interface IList<TElement> {
  add(element: TElement): number;
  addRange(): number;
  remove(element: TElement): void;
}
