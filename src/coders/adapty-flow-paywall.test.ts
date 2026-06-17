import type { AdaptyFlowPaywall } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptyFlowPaywallCoder } from './adapty-flow-paywall';
import { ProductReferenceCoder } from './product-reference';
import { ArrayCoder } from './array';

type Model = AdaptyFlowPaywall;
// `placement` is intentionally absent from the wire payload — it is a property
// of the parent AdaptyFlow and is injected by AdaptyFlowCoder, not by this coder.
const mocks: Def['AdaptyFlowPaywall'][] = [
  {
    paywall_name: 'Paywall1',
    paywall_id: '456789o',
    variation_id: 'var001',
    products: [
      {
        flow_product_id: 'flowProduct1',
        vendor_product_id: 'product1',
        adapty_product_id: 'adaptyProduct1',
        access_level_id: 'premium',
        product_type: 'subscription',
        promotional_offer_id: 'offer1',
        win_back_offer_id: 'offer2',
        base_plan_id: 'base1',
        offer_id: 'androidOffer1',
      },
      {
        vendor_product_id: 'product2',
        adapty_product_id: 'adaptyProduct2',
        access_level_id: 'premium',
        product_type: 'subscription',
      },
    ],
    web_purchase_url: 'https://example.com/purchase',
  },
  {
    paywall_id: 'instanceId267',
    variation_id: 'var002',
    paywall_name: 'Paywall2',
    products: [
      {
        vendor_product_id: 'product3',
        adapty_product_id: 'adaptyProduct3',
        access_level_id: 'vip',
        product_type: 'subscription',
      },
    ],
  },
];

// Standalone decode never yields `placement` — it is injected by the parent flow.
function toModel(mock: (typeof mocks)[number]): Omit<Model, 'placement'> {
  const _products = new ArrayCoder(() => new ProductReferenceCoder());

  return {
    id: mock.paywall_id,
    name: mock.paywall_name,
    products: _products.decode(mock.products),
    productIdentifiers: mock.products.map(product => ({
      vendorProductId: product.vendor_product_id,
      adaptyProductId: product.adapty_product_id,
      basePlanId: product.base_plan_id,
    })),
    variationId: mock.variation_id,
    ...(mock.web_purchase_url && { webPurchaseUrl: mock.web_purchase_url }),
  };
}

describe('AdaptyFlowPaywallCoder', () => {
  let coder: AdaptyFlowPaywallCoder;

  beforeEach(() => {
    coder = new AdaptyFlowPaywallCoder();
  });

  it.each(mocks)('should decode to expected result', mock => {
    expect(coder.decode(mock)).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode round-trip', mock => {
    const decoded = coder.decode(mock);
    const encoded = coder.encode(decoded);
    expect(encoded).toStrictEqual(mock);
  });

  it('should derive productIdentifiers from products', () => {
    const decoded = coder.decode(mocks[0]!);
    expect(decoded.productIdentifiers).toHaveLength(2);
    expect(decoded.productIdentifiers[0]).toEqual({
      vendorProductId: 'product1',
      adaptyProductId: 'adaptyProduct1',
      basePlanId: 'base1',
    });
    expect(decoded.productIdentifiers[1]).toEqual({
      vendorProductId: 'product2',
      adaptyProductId: 'adaptyProduct2',
      basePlanId: undefined,
    });
  });
});
