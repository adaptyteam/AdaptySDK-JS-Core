import type { IPlatformAdapter } from '@/adapters/interfaces';
import * as Input from '@/types/inputs';

type Model = Input.IdentifyParamsInput;
type Serializable = {
  app_account_token?: string;
  obfuscated_account_id?: string;
  obfuscated_profile_id?: string;
};

export class AdaptyIdentifyParamsCoder {
  constructor(private readonly platform: IPlatformAdapter) {}

  encode(params?: Model): Serializable | undefined {
    if (!params) {
      return undefined;
    }

    const result: Serializable = {};

    if (this.platform.OS === 'ios' && params.ios?.appAccountToken) {
      result.app_account_token = params.ios.appAccountToken;
    }

    if (this.platform.OS === 'android' && params.android?.obfuscatedAccountId) {
      result.obfuscated_account_id = params.android.obfuscatedAccountId;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }
}
