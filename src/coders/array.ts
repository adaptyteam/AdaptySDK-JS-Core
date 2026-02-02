import { Converter } from './types';

// Coder for Array<T>
// Uses factory function to create coder instances (supports dependency injection)
export class ArrayCoder<Model, Serializable> implements Converter<
  Model[],
  Serializable[]
> {
  constructor(
    private readonly coderFactory: () => Converter<Model, Serializable>,
  ) {}

  decode(input: Serializable[]): Model[] {
    const coder = this.coderFactory();
    return input.map(item => coder.decode(item));
  }

  encode(value: Model[]): Serializable[] {
    const coder = this.coderFactory();
    return value.map(item => coder.encode(item));
  }
}
