import { DefaultPlatformAdapter } from '@/adapters/defaults';
import { AdaptyPriceCoder } from './adapty-price';
import type { AdaptyPrice } from '@/types';
import type { Def } from '@/types/schema';

type Model = AdaptyPrice;
const mocks: Def['AdaptyPrice'][] = [
  {
    amount: 9.99,
    currency_code: 'USD',
    currency_symbol: '$',
    localized_string: '$9.99',
  },
  { amount: 9.99, currency_code: 'USD', localized_string: '$9.99' },
];

function toModel(mock: (typeof mocks)[number]): Model {
  return {
    amount: mock.amount,
    currencyCode: mock.currency_code,
    ...(mock.currency_symbol && { currencySymbol: mock.currency_symbol }),
    localizedString: mock.localized_string,
  };
}

describe('AdaptyPriceCoder', () => {
  let coder: AdaptyPriceCoder;

  beforeEach(() => {
    coder = new AdaptyPriceCoder(new DefaultPlatformAdapter());
  });

  it.each(mocks)('should decode to expected result', mock => {
    const decoded = coder.decode(mock);

    expect(decoded).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode', mock => {
    const decoded = coder.decode(mock);
    const encoded = coder.encode(decoded);

    expect(encoded).toStrictEqual(mock);
  });

  it.each([
    ['currency_code', undefined],
    ['currency_code', null],
    ['localized_string', undefined],
    ['localized_string', null],
  ] as const)('should fail to decode when required %s is %p', (key, value) => {
    const mock = { ...mocks[0]!, [key]: value };

    expect(() => coder.decode(mock as Def['AdaptyPrice'])).toThrow(
      key === 'currency_code' ? 'currencyCode' : 'localizedString',
    );
  });
});
