import type { IPlatformAdapter } from '@/adapters/interfaces';
import type { Req } from '@/types/schema';
import * as Input from '@/types/inputs';

type Model = Input.ReportTransactionParamsInput;
type Serializable = Omit<Req['ReportTransaction.Request'], 'method'>;

export class AdaptyReportTransactionParamsCoder {
  constructor(private readonly platform: IPlatformAdapter) {}

  encode(params: Model): Serializable {
    const result: Serializable = {
      transaction_id: params.transactionId,
    };

    if (params.variationId) {
      result.variation_id = params.variationId;
    }

    if (this.platform.OS === 'ios' && params.ios?.jwsTransaction) {
      result.apple_jws_transaction = params.ios.jwsTransaction;
    }

    return result;
  }
}
