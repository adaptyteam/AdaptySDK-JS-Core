import { DefaultPlatformAdapter } from '@/adapters/defaults';
import type { AdaptySubscriptionPricingTerms, ProductPeriod } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptySubscriptionPricingTermsCoder } from './adapty-subscription-pricing-terms';

type Model = AdaptySubscriptionPricingTerms;
const mocks: Def['AdaptySubscriptionPricingTerms'][] = [
  {
    billing_plan_id: 'monthly',
    billing_price: { amount: 6.99, localized_string: '$6.99' },
    billing_period: { unit: 'month', number_of_units: 1 },
    commitment_info: {
      price: { amount: 83.88, localized_string: '$83.88' },
      period: { unit: 'year', number_of_units: 1 },
    },
  },
  {
    // Unknown plans are passed through as is
    billing_plan_id: 'quarterly',
    billing_price: { amount: 59.99 },
    billing_period: { unit: 'year', number_of_units: 1 },
    commitment_info: {
      price: { amount: 59.99 },
      period: { unit: 'year', number_of_units: 1 },
    },
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  const price = (p: Def['AdaptyPrice']) => ({
    amount: p.amount,
    ...(p.localized_string && { localizedString: p.localized_string }),
  });
  const period = (p: Def['AdaptySubscriptionPeriod']) => ({
    unit: p.unit as ProductPeriod,
    numberOfUnits: p.number_of_units,
  });

  return {
    billingPlan: mock.billing_plan_id,
    billingPrice: price(mock.billing_price),
    billingPeriod: period(mock.billing_period),
    commitmentInfo: {
      price: price(mock.commitment_info.price),
      period: period(mock.commitment_info.period),
    },
  };
}

describe('AdaptySubscriptionPricingTermsCoder', () => {
  let coder: AdaptySubscriptionPricingTermsCoder;

  beforeEach(() => {
    coder = new AdaptySubscriptionPricingTermsCoder(
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
