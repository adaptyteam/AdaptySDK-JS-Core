import { DefaultPlatformAdapter } from '@/adapters/defaults';
import type { ProductReference, SubscriptionBillingPlan } from '@/types';
import type { Def } from '@/types/schema';
import type { IPlatformAdapter } from '@/adapters/interfaces';
import { ProductReferenceCoder } from './product-reference';

type Model = ProductReference;
const mocks: Def['AdaptyFlowPaywall.ProductReference'][] = [
  {
    vendor_product_id: 'product123',
    adapty_product_id: 'adaptyProduct123',
    access_level_id: 'premium',
    product_type: 'subscription',
  },
  {
    flow_product_id: 'flowProduct1',
    vendor_product_id: 'product456',
    adapty_product_id: 'adaptyProduct456',
    access_level_id: 'premium',
    product_type: 'subscription',
    pricing_terms: [
      { billing_plan_id: 'monthly', promotional_offer_id: 'offer789' },
      {
        billing_plan_id: 'up_front',
        promotional_offer_id: 'offer789',
        win_back_offer_id: 'offer456',
      },
    ],
  },
  {
    vendor_product_id: 'product111',
    adapty_product_id: 'adaptyProduct111',
    access_level_id: 'vip',
    product_type: 'subscription',
    base_plan_id: 'base222',
    offer_id: 'offer333',
  },
  {
    flow_product_id: 'flowProductXYZ',
    vendor_product_id: 'productXYZ',
    adapty_product_id: 'adaptyProductXYZ',
    access_level_id: 'premium',
    product_type: 'non_subscription',
    pricing_terms: [{ billing_plan_id: 'up_front' }],
    base_plan_id: 'baseAndroid',
    offer_id: 'offerAndroid',
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  return {
    ...(mock.flow_product_id && { flowProductId: mock.flow_product_id }),
    vendorId: mock.vendor_product_id,
    adaptyId: mock.adapty_product_id,
    accessLevelId: mock.access_level_id,
    productType: mock.product_type,
    ios: {
      ...(mock.pricing_terms && {
        pricingTerms: mock.pricing_terms.map(terms => ({
          billingPlan: terms.billing_plan_id as SubscriptionBillingPlan,
          ...(terms.promotional_offer_id && {
            promotionalOfferId: terms.promotional_offer_id,
          }),
          ...(terms.win_back_offer_id && {
            winBackOfferId: terms.win_back_offer_id,
          }),
        })),
      }),
    },
    android: {
      ...(mock.base_plan_id && { basePlanId: mock.base_plan_id }),
      ...(mock.offer_id && { offerId: mock.offer_id }),
    } as any,
  };
}

describe('ProductReferenceCoder', () => {
  let coder: ProductReferenceCoder;

  beforeEach(() => {
    coder = new ProductReferenceCoder(new DefaultPlatformAdapter());
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

  it.each(['ios', 'android'] as const)(
    'should decode a reference without pricing terms on %s',
    OS => {
      const platformCoder = new ProductReferenceCoder({
        OS,
      } as IPlatformAdapter);

      expect(platformCoder.decode(mocks[0]!).ios).toStrictEqual({});
    },
  );
});
