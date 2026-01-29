import type { AdaptyPurchaseResult } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptyProfileCoder } from '@/coders/adapty-profile';
import { SimpleCoder } from './coder';
import type { Properties } from './types';

type Model = AdaptyPurchaseResult;
type Serializable = Def['AdaptyPurchaseResult'];

export class AdaptyPurchaseResultCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    type: {
      key: 'type',
      required: true,
      type: 'string',
    },
  };

  override decode(data: Serializable): Model {
    const baseResult = super.decode(data);
    if (baseResult.type === 'success') {
      if (!data.profile) {
        throw new Error(
          'Profile is required for success type of purchase result',
        );
      }
      return {
        ...baseResult,
        profile: new AdaptyProfileCoder(this.platform).decode(data.profile),
        ...(this.platform.OS === 'ios' && data.apple_jws_transaction
          ? { ios: { jwsTransaction: data.apple_jws_transaction } }
          : {}),
        ...(this.platform.OS === 'android' && data.google_purchase_token
          ? { android: { purchaseToken: data.google_purchase_token } }
          : {}),
      };
    }
    return baseResult;
  }

  override encode(data: Model): Serializable {
    const { type } = data;

    if (type === 'success') {
      if (!('profile' in data)) {
        throw new Error(
          'Profile is required for success type of purchase result',
        );
      }

      return {
        type: 'success',
        profile: new AdaptyProfileCoder(this.platform).encode(data.profile),
        ...(this.platform.OS === 'ios' && data.ios?.jwsTransaction
          ? { apple_jws_transaction: data.ios.jwsTransaction }
          : {}),
        ...(this.platform.OS === 'android' && data.android?.purchaseToken
          ? { google_purchase_token: data.android.purchaseToken }
          : {}),
      };
    }

    return super.encode({ type });
  }
}
