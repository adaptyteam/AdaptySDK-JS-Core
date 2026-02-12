import { Converter } from './types';

type Model = Record<string, unknown>;
type Serialized = string;

export class JSONCoder implements Converter<Model, Serialized> {
  decode(input: Serialized): Model {
    if (!input) {
      return {};
    }

    return JSON.parse(input) as Model;
  }
  encode(value: Model): Serialized {
    if (Object.keys(value).length === 0) {
      return '';
    }
    return JSON.stringify(value);
  }
}
