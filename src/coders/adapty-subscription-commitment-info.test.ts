import { DefaultPlatformAdapter } from '@/adapters/defaults';
import type { AdaptySubscriptionCommitmentInfo, ProductPeriod } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptySubscriptionCommitmentInfoCoder } from './adapty-subscription-commitment-info';

type Model = AdaptySubscriptionCommitmentInfo;
const mocks: Def['AdaptySubscriptionCommitmentInfo'][] = [
  {
    price: {
      amount: 83.88,
      currency_code: 'USD',
      currency_symbol: '$',
      localized_string: '$83.88',
    },
    period: { unit: 'year', number_of_units: 1 },
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  return {
    price: {
      amount: mock.price.amount,
      currencyCode: mock.price.currency_code,
      currencySymbol: mock.price.currency_symbol,
      localizedString: mock.price.localized_string,
    },
    period: {
      unit: mock.period.unit as ProductPeriod,
      numberOfUnits: mock.period.number_of_units,
    },
  };
}

describe('AdaptySubscriptionCommitmentInfoCoder', () => {
  let coder: AdaptySubscriptionCommitmentInfoCoder;

  beforeEach(() => {
    coder = new AdaptySubscriptionCommitmentInfoCoder(
      new DefaultPlatformAdapter(),
    );
  });

  it.each(mocks)('should decode to expected result', mock => {
    expect(coder.decode(mock)).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode', mock => {
    expect(coder.encode(coder.decode(mock))).toStrictEqual(mock);
  });
});
