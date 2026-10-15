import type { AdaptySubscriptionPricingTerms } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';
import { AdaptyPriceCoder } from './adapty-price';
import { AdaptySubscriptionPeriodCoder } from './adapty-subscription-period';
import { AdaptySubscriptionCommitmentInfoCoder } from './adapty-subscription-commitment-info';

type Model = AdaptySubscriptionPricingTerms;
type Serializable = Def['AdaptySubscriptionPricingTerms'];

export class AdaptySubscriptionPricingTermsCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    billingPlan: {
      key: 'billing_plan_id',
      required: true,
      type: 'string',
    },
    billingPrice: {
      key: 'billing_price',
      required: true,
      type: 'object',
      converter: new AdaptyPriceCoder(this.platform),
    },
    billingPeriod: {
      key: 'billing_period',
      required: true,
      type: 'object',
      converter: new AdaptySubscriptionPeriodCoder(this.platform),
    },
    commitmentInfo: {
      key: 'commitment_info',
      required: true,
      type: 'object',
      converter: new AdaptySubscriptionCommitmentInfoCoder(this.platform),
    },
  };
}
