import type { AdaptySubscriptionDetails } from '@/types';
import type { Def } from '@/types/schema';
import type { IPlatformAdapter } from '@/adapters/interfaces';
import { AdaptySubscriptionDetailsCoder } from './adapty-subscription-details';
import { AdaptySubscriptionPeriodCoder } from './adapty-subscription-period';
import { AdaptySubscriptionOfferCoder } from '@/coders/adapty-subscription-offer';
import { AdaptySubscriptionPricingTermsCoder } from './adapty-subscription-pricing-terms';

type Model = AdaptySubscriptionDetails;
const mocks: Def['AdaptyProduct.Subscription'][] = [
  {
    base_plan_id: 'androidPlan1',
    renewal_type: 'prepaid',
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
  {
    group_identifier: 'group1',
    period: {
      unit: 'year',
      number_of_units: 1,
    },
    localized_period: '1 year',
    pricing_terms: {
      billing_plan_id: 'monthly',
      billing_price: {
        amount: 6.99,
        currency_code: 'USD',
        currency_symbol: '$',
        localized_string: '$6.99',
      },
      billing_period: {
        unit: 'month',
        number_of_units: 1,
      },
      commitment_info: {
        price: {
          amount: 83.88,
          currency_code: 'USD',
          currency_symbol: '$',
          localized_string: '$83.88',
        },
        period: {
          unit: 'year',
          number_of_units: 1,
        },
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
];

function toModel(mock: (typeof mocks)[number]): Model {
  const _period = new AdaptySubscriptionPeriodCoder();
  const _offer = new AdaptySubscriptionOfferCoder();
  const _pricingTerms = new AdaptySubscriptionPricingTermsCoder();

  return {
    subscriptionPeriod: _period.decode(mock.period),
    ...(mock.localized_period && {
      localizedSubscriptionPeriod: mock.localized_period,
    }),
    ...(mock.offer && {
      offer: _offer.decode(mock.offer),
    }),
    ...(mock.base_plan_id
      ? {
          android: {
            basePlanId: mock.base_plan_id,
            renewalType: mock.renewal_type,
          },
        }
      : {
          ios: {
            subscriptionGroupIdentifier: mock.group_identifier,
            ...(mock.pricing_terms && {
              pricingTerms: _pricingTerms.decode(mock.pricing_terms),
            }),
          },
        }),
  };
}

describe('AdaptySubscriptionDetailsCoder', () => {
  let coder: AdaptySubscriptionDetailsCoder;

  beforeEach(() => {
    coder = new AdaptySubscriptionDetailsCoder();
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

  it('should decode iOS pricing terms', () => {
    const decoded = coder.decode(mocks[1]!);

    expect(decoded.ios?.pricingTerms).toStrictEqual({
      billingPlan: 'monthly',
      billingPrice: {
        amount: 6.99,
        currencyCode: 'USD',
        currencySymbol: '$',
        localizedString: '$6.99',
      },
      billingPeriod: { unit: 'month', numberOfUnits: 1 },
      commitmentInfo: {
        price: {
          amount: 83.88,
          currencyCode: 'USD',
          currencySymbol: '$',
          localizedString: '$83.88',
        },
        period: { unit: 'year', numberOfUnits: 1 },
      },
    });
  });

  it('should drop iOS pricing terms from Android subscriptions', () => {
    const android = new AdaptySubscriptionDetailsCoder({
      OS: 'android',
    } as IPlatformAdapter);
    const decoded = android.decode({
      ...mocks[0]!,
      pricing_terms: mocks[1]!.pricing_terms,
    });

    expect(decoded.ios).toBeUndefined();
    expect(decoded.android).toStrictEqual({
      basePlanId: 'androidPlan1',
      renewalType: 'prepaid',
    });
  });

  it('should keep iOS pricing terms on iOS', () => {
    const ios = new AdaptySubscriptionDetailsCoder({
      OS: 'ios',
    } as IPlatformAdapter);

    expect(ios.decode(mocks[1]!).ios?.pricingTerms?.billingPlan).toBe(
      'monthly',
    );
  });
});
