import type { Properties } from './types';
import type { ProductReference } from '@/types';
import type { Def } from '@/types/schema';
import { SimpleCoder } from './coder';
import { ArrayCoder } from './array';
import { ProductReferencePricingTermsCoder } from './product-reference-pricing-terms';

type Model = ProductReference;
type Serializable = Def['AdaptyFlowPaywall.ProductReference'];

export class ProductReferenceCoder extends SimpleCoder<Model, Serializable> {
  protected properties: Properties<Model, Serializable> = {
    flowProductId: {
      key: 'flow_product_id',
      required: false,
      type: 'string',
    },
    vendorId: {
      key: 'vendor_product_id',
      required: true,
      type: 'string',
    },
    adaptyId: {
      key: 'adapty_product_id',
      required: true,
      type: 'string',
    },
    accessLevelId: {
      key: 'access_level_id',
      required: true,
      type: 'string',
    },
    productType: {
      key: 'product_type',
      required: true,
      type: 'string',
    },
    ios: {
      pricingTerms: {
        key: 'pricing_terms',
        required: false,
        type: 'array',
        converter: new ArrayCoder(
          () => new ProductReferencePricingTermsCoder(this.platform),
        ),
      },
    },
    android: {
      basePlanId: {
        key: 'base_plan_id',
        required: false,
        type: 'string',
      },
      offerId: {
        key: 'offer_id',
        required: false,
        type: 'string',
      },
    },
  };
}
