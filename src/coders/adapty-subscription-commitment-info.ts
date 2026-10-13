import type { AdaptySubscriptionCommitmentInfo } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';
import { AdaptyPriceCoder } from './adapty-price';
import { AdaptySubscriptionPeriodCoder } from './adapty-subscription-period';

type Model = AdaptySubscriptionCommitmentInfo;
type Serializable = Def['AdaptySubscriptionCommitmentInfo'];

export class AdaptySubscriptionCommitmentInfoCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    price: {
      key: 'price',
      required: true,
      type: 'object',
      converter: new AdaptyPriceCoder(),
    },
    period: {
      key: 'period',
      required: true,
      type: 'object',
      converter: new AdaptySubscriptionPeriodCoder(),
    },
  };
}
