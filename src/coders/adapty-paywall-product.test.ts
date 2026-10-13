import type { AdaptyPaywallProduct } from '@/types';
import type { Def } from '@/types/schema';
import type { IPlatformAdapter } from '@/adapters/interfaces';
import { AdaptyPriceCoder } from './adapty-price';
import { AdaptyPaywallProductCoder } from './adapty-paywall-product';
import { AdaptySubscriptionDetailsCoder } from './adapty-subscription-details';

type Model = AdaptyPaywallProduct;
const mocks: Def['AdaptyPaywallProduct.Response'][] = [
  {
    is_family_shareable: false,
    localized_description: 'Get premium features with this plan',
    localized_title: 'Yearly Premium Plan',
    paywall_ab_test_name: 'abTest1',
    paywall_name: 'Premium Subscription',
    paywall_variation_id: 'variation1',
    region_code: 'US',
    payload_data: 'examplePayloadData',
    vendor_product_id: 'yearly.premium.6999',
    adapty_product_id: 'adapty_product_id',
    access_level_id: 'access_level_id',
    product_type: 'product_type',
    paywall_product_index: 0,
    web_purchase_url: 'https://example.com/purchase',
    price: {
      amount: 69.99,
      currency_code: 'USD',
      currency_symbol: '$',
      localized_string: '$69.99',
    },
    subscription: {
      base_plan_id: 'androidPlan1',
      renewal_type: 'autorenewable',
      period: {
        unit: 'year',
        number_of_units: 1,
      },
      localized_period: '1 year',
      offer: {
        offer_identifier: {
          type: 'introductory',
          id: 'test_intro_offer',
        },
        phases: [
          {
            price: {
              amount: 49.99,
              currency_code: 'USD',
              currency_symbol: '$',
              localized_string: '$49.99',
            },
            number_of_periods: 2,
            payment_mode: 'pay_as_you_go',
            subscription_period: {
              unit: 'month',
              number_of_units: 3,
            },
            localized_subscription_period: '3 months',
            localized_number_of_periods: '2',
          },
        ],
        offer_tags: ['tag1', 'tag2'],
      },
    },
  },
  {
    is_family_shareable: true,
    localized_description: 'Get premium features with this plan',
    localized_title: 'Yearly Premium Plan',
    paywall_ab_test_name: 'abTest1',
    paywall_name: 'Premium Subscription',
    paywall_variation_id: 'variation1',
    region_code: 'US',
    payload_data: 'examplePayloadData',
    vendor_product_id: 'yearly.premium.6999',
    adapty_product_id: 'adapty_product_id',
    access_level_id: 'access_level_id',
    product_type: 'product_type',
    paywall_product_index: 1,
    price: {
      amount: 69.99,
      currency_code: 'USD',
      currency_symbol: '$',
      localized_string: '$69.99',
    },
    subscription: {
      group_identifier: 'group1',
      period: {
        unit: 'year',
        number_of_units: 1,
      },
      localized_period: '1 year',
      pricing_terms: {
        billing_plan_id: 'monthly',
        billing_price: { amount: 6.99, localized_string: '$6.99' },
        billing_period: { unit: 'month', number_of_units: 1 },
        commitment_info: {
          price: { amount: 83.88, localized_string: '$83.88' },
          period: { unit: 'year', number_of_units: 1 },
        },
      },
      offer: {
        offer_identifier: {
          type: 'promotional',
          id: 'test_promo_offer',
        },
        phases: [
          {
            price: {
              amount: 29.99,
              currency_code: 'USD',
              currency_symbol: '$',
              localized_string: '$29.99',
            },
            number_of_periods: 1,
            payment_mode: 'free_trial',
            subscription_period: {
              unit: 'month',
              number_of_units: 1,
            },
            localized_subscription_period: '1 month',
            localized_number_of_periods: '1',
          },
        ],
      },
    },
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  const _price = new AdaptyPriceCoder();
  const _details = new AdaptySubscriptionDetailsCoder();

  return {
    ios: {
      isFamilyShareable: mock.is_family_shareable as boolean,
    },
    adaptyId: mock.adapty_product_id,
    accessLevelId: mock.access_level_id,
    productType: mock.product_type,
    paywallProductIndex: mock.paywall_product_index,
    localizedDescription: mock.localized_description,
    localizedTitle: mock.localized_title,
    paywallABTestName: mock.paywall_ab_test_name,
    paywallName: mock.paywall_name,
    variationId: mock.paywall_variation_id,
    regionCode: mock.region_code,
    ...(mock.web_purchase_url && { webPurchaseUrl: mock.web_purchase_url }),
    payloadData: mock.payload_data,
    vendorProductId: mock.vendor_product_id,
    ...(mock.price && {
      price: _price.decode(mock.price),
    }),
    ...(mock.subscription && {
      subscription: _details.decode(mock.subscription),
    }),
  };
}

describe('AdaptyPaywallProductCoder', () => {
  let coder: AdaptyPaywallProductCoder;

  beforeEach(() => {
    coder = new AdaptyPaywallProductCoder();
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

  describe('getInput', () => {
    it('should map the billing plan and the offer identifier', () => {
      expect(coder.getInput(mocks[1]!).subscription).toStrictEqual({
        pricing_terms: { billing_plan_id: 'monthly' },
        offer: {
          offer_identifier: { type: 'promotional', id: 'test_promo_offer' },
        },
      });
    });

    it('should omit pricing terms when the product has none', () => {
      expect(coder.getInput(mocks[0]!).subscription).toStrictEqual({
        offer: {
          offer_identifier: { type: 'introductory', id: 'test_intro_offer' },
        },
      });
    });
  });

  describe('getInput after a model round-trip', () => {
    const ios = new AdaptyPaywallProductCoder({
      OS: 'ios',
    } as IPlatformAdapter);

    it('should send the billing plan when there is no offer', () => {
      const { offer: _offer, ...subscription } = mocks[1]!.subscription!;
      const model = ios.decode({ ...mocks[1]!, subscription });

      expect(ios.getInput(ios.encode(model)).subscription).toStrictEqual({
        pricing_terms: { billing_plan_id: 'monthly' },
      });
    });

    it('should omit the subscription for Android products without an offer', () => {
      const android = new AdaptyPaywallProductCoder({
        OS: 'android',
      } as IPlatformAdapter);
      const { offer: _offer, ...subscription } = mocks[0]!.subscription!;
      const model = android.decode({ ...mocks[0]!, subscription });

      expect(android.getInput(android.encode(model)).subscription).toBe(
        undefined,
      );
    });
  });
});
