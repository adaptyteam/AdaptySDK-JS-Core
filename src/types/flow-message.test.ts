import type { AdaptyFlowMessage, AdaptyFlowMessageValue } from './flow-message';

// Type-level checks: verified by `yarn tsc`.
type JsonAlias = { kind: string; count: number; tags: string[] };
interface NonJsonInterface {
  a: number;
}

const nested: AdaptyFlowMessage = {
  a: 1,
  b: 'x',
  c: true,
  d: null,
  e: [1, 'y'],
  f: { g: [{ h: null }] },
};
const readonlyList: readonly number[] = [1, 2];
const withReadonly: AdaptyFlowMessage = { list: readonlyList };
const alias: JsonAlias = { kind: 'k', count: 1, tags: ['t'] };
const fromAlias: AdaptyFlowMessage = alias;
const value: AdaptyFlowMessageValue = [nested, null];

// @ts-expect-error Date is not a JSON value
const withDate: AdaptyFlowMessage = { d: new Date() };
// @ts-expect-error functions are not JSON values
const withFunction: AdaptyFlowMessage = { f: () => 1 };
// @ts-expect-error undefined is not a JSON value
const withUndefined: AdaptyFlowMessage = { u: undefined };
// @ts-expect-error Map is not a JSON value
const withMap: AdaptyFlowMessage = { m: new Map() };
const iface: NonJsonInterface = { a: 1 };
// @ts-expect-error interfaces have no implicit index signature
const fromInterface: AdaptyFlowMessage = iface;

describe('AdaptyFlowMessage', () => {
  it('accepts JSON-like values', () => {
    expect([nested, withReadonly, fromAlias, value]).toHaveLength(4);
    expect([
      withDate,
      withFunction,
      withUndefined,
      withMap,
      fromInterface,
    ]).toHaveLength(5);
  });
});
