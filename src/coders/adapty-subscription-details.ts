import type { AdaptySubscriptionDetails } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';
import { AdaptySubscriptionPeriodCoder } from './adapty-subscription-period';
import { AdaptySubscriptionOfferCoder } from '@/coders/adapty-subscription-offer';
import { AdaptySubscriptionPricingTermsCoder } from './adapty-subscription-pricing-terms';

type Model = AdaptySubscriptionDetails;
type Serializable = Def['AdaptyProduct.Subscription'];
// Same shape for paywall and promoted product requests
type SubscriptionInput = NonNullable<
  Def['AdaptyPaywallProduct.Request']['subscription']
>;

export class AdaptySubscriptionDetailsCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    subscriptionPeriod: {
      key: 'period',
      required: true,
      type: 'object',
      converter: new AdaptySubscriptionPeriodCoder(this.platform),
    },
    localizedSubscriptionPeriod: {
      key: 'localized_period',
      required: false,
      type: 'string',
    },
    offer: {
      key: 'offer',
      required: false,
      type: 'object',
      converter: new AdaptySubscriptionOfferCoder(this.platform),
    },
    ios: {
      subscriptionGroupIdentifier: {
        key: 'group_identifier',
        required: false,
        type: 'string',
      },
      pricingTerms: {
        key: 'pricing_terms',
        required: false,
        type: 'object',
        converter: new AdaptySubscriptionPricingTermsCoder(this.platform),
      },
    },
    android: {
      basePlanId: {
        key: 'base_plan_id',
        required: true,
        type: 'string',
      },
      renewalType: {
        key: 'renewal_type',
        required: false,
        type: 'string',
      },
    },
  };

  override decode(data: Serializable): Model {
    const baseResult = super.decode(data);
    const propToRemove = data.base_plan_id ? 'ios' : 'android';
    const { [propToRemove]: _, ...partialData } = baseResult;
    return partialData;
  }
}

// Picks the purchase-relevant subset of subscription details for native requests
export function getSubscriptionInput(
  data: Serializable | undefined,
): SubscriptionInput | undefined {
  const billingPlanId = data?.pricing_terms?.billing_plan_id;
  const offerIdentifier = data?.offer?.offer_identifier;
  if (!billingPlanId && !offerIdentifier) return undefined;

  return {
    ...(billingPlanId && { pricing_terms: { billing_plan_id: billingPlanId } }),
    ...(offerIdentifier && { offer: { offer_identifier: offerIdentifier } }),
  };
}
