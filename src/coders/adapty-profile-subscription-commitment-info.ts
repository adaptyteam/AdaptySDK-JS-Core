import type { AdaptyProfileSubscriptionCommitmentInfo } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';
import { DateCoder } from './date';

type Model = AdaptyProfileSubscriptionCommitmentInfo;
type Serializable = Def['AdaptyProfile.SubscriptionCommitmentInfo'];

export class AdaptyProfileSubscriptionCommitmentInfoCoder extends SimpleCoder<
  Model,
  Serializable
> {
  protected properties: Properties<Model, Serializable> = {
    billingPeriodNumber: {
      key: 'billing_period_number',
      required: true,
      type: 'number',
    },
    totalBillingPeriods: {
      key: 'total_billing_periods',
      required: true,
      type: 'number',
    },
    expiresAt: {
      key: 'expires_at',
      required: true,
      type: 'string',
      converter: new DateCoder(),
    },
  };
}
