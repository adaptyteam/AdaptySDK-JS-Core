import type { AdaptyFlowPaywall } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { ProductReferenceCoder } from './product-reference';
import { ArrayCoder } from './array';
import { Coder } from './coder';
import { AdaptyPlacementCoder } from '@/coders/adapty-placement';

type Model = AdaptyFlowPaywall;
// `placement` is a property of the parent AdaptyFlow and is not emitted per
// variation on the wire — it is injected on decode by AdaptyFlowCoder. Hence it
// is optional in the codable shape and stripped on encode.
type CodableModel = Omit<Model, 'productIdentifiers' | 'placement'> &
  Partial<Pick<Model, 'placement'>>;
type Serializable = Def['AdaptyFlowPaywall'];

export class AdaptyFlowPaywallCoder extends Coder<
  Model,
  CodableModel,
  Serializable
> {
  protected properties: Properties<CodableModel, Serializable> = {
    placement: {
      key: 'placement',
      required: false,
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
    // `placement` may be absent here — it is injected by the parent
    // AdaptyFlowCoder on decode, so the cast to the full model is safe.
    return {
      ...codablePart,
      productIdentifiers: codablePart.products.map(product => ({
        vendorProductId: product.vendorId,
        adaptyProductId: product.adaptyId,
        basePlanId: product.android?.basePlanId,
      })),
    } as Model;
  }

  override encode(data: Model): Serializable {
    // Drop the derived `productIdentifiers` and the parent-owned `placement`.
    const { productIdentifiers, placement, ...codablePart } = data;
    return super.encode(codablePart);
  }
}
