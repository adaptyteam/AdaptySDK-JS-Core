import { DefaultPlatformAdapter } from '@/adapters/defaults';
import type { ProductReferencePricingTerms } from '@/types';
import type { Def } from '@/types/schema';
import { ProductReferencePricingTermsCoder } from './product-reference-pricing-terms';

type Model = ProductReferencePricingTerms;
const mocks: NonNullable<
  Def['AdaptyFlowPaywall.ProductReference']['pricing_terms']
> = [
  { billing_plan_id: 'up_front' },
  {
    billing_plan_id: 'monthly',
    promotional_offer_id: 'promo1',
    win_back_offer_id: 'winBack1',
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  return {
    billingPlan: mock.billing_plan_id,
    ...(mock.promotional_offer_id && {
      promotionalOfferId: mock.promotional_offer_id,
    }),
    ...(mock.win_back_offer_id && { winBackOfferId: mock.win_back_offer_id }),
  };
}

describe('ProductReferencePricingTermsCoder', () => {
  let coder: ProductReferencePricingTermsCoder;

  beforeEach(() => {
    coder = new ProductReferencePricingTermsCoder(new DefaultPlatformAdapter());
  });

  it.each(mocks)('should decode to expected result', mock => {
    expect(coder.decode(mock)).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode', mock => {
    expect(coder.encode(coder.decode(mock))).toStrictEqual(mock);
  });
});
