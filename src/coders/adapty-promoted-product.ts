import type { AdaptyPromotedProduct } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';
import { AdaptyPriceCoder } from './adapty-price';
import { AdaptySubscriptionDetailsCoder } from './adapty-subscription-details';

type Model = AdaptyPromotedProduct;
type Serializable = Def['AdaptyPromotedProduct.Response'];

export class AdaptyPromotedProductCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    vendorProductId: {
      key: 'vendor_product_id',
      required: true,
      type: 'string',
    },
    localizedDescription: {
      key: 'localized_description',
      required: true,
      type: 'string',
    },
    localizedTitle: { key: 'localized_title', required: true, type: 'string' },
    regionCode: { key: 'region_code', required: false, type: 'string' },
    price: {
      key: 'price',
      required: false, // Native SDKs require this
      type: 'object',
      converter: new AdaptyPriceCoder(),
    },
    payloadData: { key: 'payload_data', required: false, type: 'string' },
    subscription: {
      key: 'subscription',
      required: false,
      type: 'object',
      converter: new AdaptySubscriptionDetailsCoder(),
    },
    ios: {
      isFamilyShareable: {
        key: 'is_family_shareable',
        required: true,
        type: 'boolean',
      },
    },
  };

  public getInput(data: Serializable): Def['AdaptyPromotedProduct.Request'] {
    return {
      vendor_product_id: data.vendor_product_id,
      payload_data: data.payload_data,
      subscription: data.subscription?.offer
        ? {
            offer: {
              offer_identifier: data.subscription.offer.offer_identifier,
            },
          }
        : undefined,
    };
  }
}
