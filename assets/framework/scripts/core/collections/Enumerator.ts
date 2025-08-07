export interface IEnumerator<T> {
  current(): T;
  moveNext(): boolean;
  reset(): void;
}

export interface IEnumerable<T> {
  getEnumerator(): IEnumerator<T>;
  [Symbol.iterator](): Iterator<T>;
}

export class Enumerator<T> implements IEnumerator<T> {
  private gen: Generator<T>;
  private currentValue: T | undefined;
  private hasNext: boolean;

  constructor(private readonly enumerable: IEnumerable<T>) {
    this.gen = this.createGenerator();
    this.currentValue = undefined;
    this.hasNext = true;
  }

  private createGenerator(): Generator<T> {
    return this.enumerable[Symbol.iterator]() as Generator<T>;
  }

  current(): T {
    if (this.currentValue === undefined) {
      throw new Error("Iterator is not initialized or exhausted");
    }
    return this.currentValue;
  }

  moveNext(): boolean {
    const { value, done } = this.gen.next();
    this.currentValue = value;
    this.hasNext = !done;
    return this.hasNext;
  }

  reset(): void {
    this.gen = this.createGenerator();
    this.currentValue = undefined;
    this.hasNext = true;
  }
}

export class Enumerable<T> implements IEnumerable<T> {
  constructor(private readonly source: Iterable<T>) {}

  *generator(): Generator<T> {
    for (const item of this.source) {
      yield item;
    }
  }

  *[Symbol.iterator](): Generator<T> {
    yield* this.generator();
  }

  getEnumerator(): IEnumerator<T> {
    return new Enumerator<T>(this);
  }

  static fromRange(
    start: number,
    end: number,
    step: number = 1
  ): Enumerable<number> {
    return new Enumerable<number>({
      *[Symbol.iterator]() {
        for (let i = start; i < end; i += step) {
          yield i;
        }
      },
    });
  }

  static fromItems<T>(...items: T[]): Enumerable<T> {
    return new Enumerable<T>(items);
  }

  static empty<T>(): Enumerable<T> {
    return new Enumerable<T>([]);
  }
}

// 使用示例
const numberRange = Enumerable.fromRange(1, 5); // 1, 2, 3, 4
const strings = Enumerable.fromItems("a", "b", "c"); // "a", "b", "c"

// 支持任意可迭代对象
const existingArray = [10, 20, 30];
const arrayEnumerable = new Enumerable(existingArray);
