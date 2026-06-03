import type { AdaptyFlowPaywall } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { ProductReferenceCoder } from './product-reference';
import { ArrayCoder } from './array';
import { Coder } from './coder';
import { AdaptyPlacementCoder } from '@/coders/adapty-placement';

type Model = AdaptyFlowPaywall;
type CodableModel = Omit<Model, 'productIdentifiers'>;
type Serializable = Def['AdaptyFlowPaywall'];

export class AdaptyFlowPaywallCoder extends Coder<
  Model,
  CodableModel,
  Serializable
> {
  protected properties: Properties<CodableModel, Serializable> = {
    placement: {
      key: 'placement',
      required: true,
      type: 'object',
      converter: new AdaptyPlacementCoder(),
    },
    id: { key: 'paywall_id', required: true, type: 'string' },
    name: { key: 'paywall_name', required: true, type: 'string' },
    products: {
      key: 'products',
      required: true,
      type: 'array',
      converter: new ArrayCoder(() => new ProductReferenceCoder()),
    },
    variationId: { key: 'variation_id', required: true, type: 'string' },
    webPurchaseUrl: {
      key: 'web_purchase_url',
      required: false,
      type: 'string',
    },
  };

  override decode(data: Serializable): Model {
    const codablePart = super.decode(data);
    return {
      ...codablePart,
      productIdentifiers: codablePart.products.map(product => ({
        vendorProductId: product.vendorId,
        adaptyProductId: product.adaptyId,
        basePlanId: product.android?.basePlanId,
      })),
    };
  }

  override encode(data: Model): Serializable {
    const { productIdentifiers, ...codablePart } = data;
    return super.encode(codablePart);
  }
}
