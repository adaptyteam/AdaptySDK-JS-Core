import type { AdaptyProfileSubscriptionCommitmentInfo } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptyProfileSubscriptionCommitmentInfoCoder } from './adapty-profile-subscription-commitment-info';

type Model = AdaptyProfileSubscriptionCommitmentInfo;
const mocks: Def['AdaptyProfile.SubscriptionCommitmentInfo'][] = [
  {
    billing_period_number: 3,
    total_billing_periods: 12,
    expires_at: '2024-08-08T12:00:00.000Z',
  },
  {
    billing_period_number: 0,
    total_billing_periods: 12,
    expires_at: '2025-01-01T00:00:00.000Z',
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  return {
    billingPeriodNumber: mock.billing_period_number,
    totalBillingPeriods: mock.total_billing_periods,
    expiresAt: new Date(mock.expires_at),
  };
}

describe('AdaptyProfileSubscriptionCommitmentInfoCoder', () => {
  let coder: AdaptyProfileSubscriptionCommitmentInfoCoder;

  beforeEach(() => {
    coder = new AdaptyProfileSubscriptionCommitmentInfoCoder();
  });

  it.each(mocks)('should decode to expected result', mock => {
    expect(coder.decode(mock)).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode', mock => {
    expect(coder.encode(coder.decode(mock))).toStrictEqual(mock);
  });
});
