import type { AdaptyFlowPaywall, ProductReference } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { ProductReferenceCoder } from './product-reference';
import { ArrayCoder } from './array';
import { Coder } from './coder';
import { AdaptyPlacementCoder } from '@/coders/adapty-placement';

type Model = AdaptyFlowPaywall;
// `products` is an internal wire-only field: it is the source for deriving
// `productIdentifiers` on decode and is required by the native wire schema on
// encode. It is intentionally NOT part of the public `AdaptyFlowPaywall` type,
// but it is carried on the runtime object so encode round-trips preserve it.
type CodableModel = Omit<Model, 'productIdentifiers'> & {
  products?: ProductReference[];
};
type Serializable = Def['AdaptyFlowPaywall'];

// Wire-level properties including the internal `products` field.
// The `as unknown as` cast is intentional: `products` is required on the wire
// but optional in CodableModel (so that Model extends CodableModel for
// override compatibility). The cast bridges the required/optional mismatch.
const PROPERTIES = {
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
} as unknown as Properties<CodableModel, Serializable>;

export class AdaptyFlowPaywallCoder extends Coder<
  Model,
  CodableModel,
  Serializable
> {
  protected properties: Properties<CodableModel, Serializable> = PROPERTIES;

  override decode(data: Serializable): Model {
    const codablePart = super.decode(data);
    // Keep `products` on the runtime object (for encode round-trip) while
    // exposing only `productIdentifiers` on the public type.
    // products is always present on the wire (required: true in PROPERTIES).
    return {
      ...codablePart,
      productIdentifiers: codablePart.products!.map(product => ({
        vendorProductId: product.vendorId,
        adaptyProductId: product.adaptyId,
        basePlanId: product.android?.basePlanId,
      })),
    } as Model;
  }

  override encode(data: Model): Serializable {
    // `products` is carried at runtime even though it is not on the public type.
    const { productIdentifiers, ...codablePart } = data as CodableModel &
      Pick<Model, 'productIdentifiers'>;
    return super.encode(codablePart);
  }
}
