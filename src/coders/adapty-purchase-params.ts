import type { IPlatformAdapter } from '@/adapters/interfaces';
import * as Input from '@/types/inputs';

type Model = Input.MakePurchaseParamsInput;
type Serializable = Record<string, unknown>;

function isDeprecatedType(
  data: unknown,
): data is { android?: Input.AdaptyAndroidSubscriptionUpdateParameters } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'android' in data &&
    typeof data.android === 'object' &&
    data.android !== null &&
    'oldSubVendorProductId' in data.android &&
    'prorationMode' in data.android
  );
}

export class AdaptyPurchaseParamsCoder {
  constructor(private readonly platform: IPlatformAdapter) {}

  encode(data: Model): Serializable {
    if (this.platform.OS !== 'android') {
      return {};
    }

    const purchaseParams: Serializable = {};

    if (isDeprecatedType(data)) {
      if (data.android) {
        purchaseParams['subscription_update_params'] = {
          replacement_mode: data.android.prorationMode,
          old_sub_vendor_product_id: data.android.oldSubVendorProductId,
        };

        if (data.android.isOfferPersonalized) {
          purchaseParams['is_offer_personalized'] =
            data.android.isOfferPersonalized;
        }
      }
      return purchaseParams;
    }

    if (data.android) {
      if (data.android.subscriptionUpdateParams) {
        purchaseParams['subscription_update_params'] = {
          replacement_mode: data.android.subscriptionUpdateParams.prorationMode,
          old_sub_vendor_product_id:
            data.android.subscriptionUpdateParams.oldSubVendorProductId,
        };
      }

      if (data.android.isOfferPersonalized !== undefined) {
        purchaseParams['is_offer_personalized'] =
          data.android.isOfferPersonalized;
      }
    }

    return purchaseParams;
  }
}
