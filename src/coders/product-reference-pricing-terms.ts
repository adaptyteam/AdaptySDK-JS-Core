import type { ProductReferencePricingTerms } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';

type Model = ProductReferencePricingTerms;
type Serializable = NonNullable<
  Def['AdaptyFlowPaywall.ProductReference']['pricing_terms']
>[number];

export class ProductReferencePricingTermsCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    billingPlan: {
      key: 'billing_plan_id',
      required: true,
      type: 'string',
    },
    promotionalOfferId: {
      key: 'promotional_offer_id',
      required: false,
      type: 'string',
    },
    winBackOfferId: {
      key: 'win_back_offer_id',
      required: false,
      type: 'string',
    },
  };
}
