import { DefaultPlatformAdapter } from '@/adapters/defaults';
import type {
  AdaptySubscription,
  CancellationReason,
  SubscriptionBillingPlan,
  VendorStore,
} from '@/types';
import type { Def } from '@/types/schema';
import { AdaptySubscriptionCoder } from './adapty-subscription';

type Model = AdaptySubscription;
const mocks: Def['AdaptyProfile.Subscription'][] = [
  {
    activated_at: '2023-08-09T12:34:56.789Z',
    billing_plan_id: 'monthly',
    commitment: {
      billing_period_number: 3,
      total_billing_periods: 12,
      expires_at: '2024-08-08T12:00:00.000Z',
    },
    is_active: true,
    is_in_grace_period: false,
    is_lifetime: false,
    is_refund: false,
    is_sandbox: false,
    store: 'App Store',
    vendor_original_transaction_id: 'originalTransaction123',
    vendor_product_id: 'product123',
    vendor_transaction_id: 'transaction123',
    will_renew: true,
  },
  {
    activated_at: '2022-07-09T12:34:56.789Z',
    billing_issue_detected_at: '2023-08-09T12:34:56.789Z',
    cancellation_reason: 'User Choice',
    expires_at: '2023-08-09T12:34:56.789Z',
    is_active: false,
    is_in_grace_period: true,
    is_lifetime: true,
    is_refund: true,
    is_sandbox: true,
    renewed_at: '2023-07-09T12:34:56.789Z',
    starts_at: '2023-08-09T12:34:56.789Z',
    store: 'Google Play',
    offer_id: 'androidOffer1',
    unsubscribed_at: '2023-08-09T12:34:56.789Z',
    vendor_original_transaction_id: 'originalTransaction456',
    vendor_product_id: 'product456',
    vendor_transaction_id: 'transaction456',
    will_renew: false,
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  return {
    activatedAt: new Date(mock.activated_at),
    ...(mock.billing_issue_detected_at && {
      billingIssueDetectedAt: new Date(mock.billing_issue_detected_at),
    }),
    ...(mock.expires_at && {
      expiresAt: new Date(mock.expires_at),
    }),
    ...(mock.renewed_at && {
      renewedAt: new Date(mock.renewed_at),
    }),
    ...(mock.starts_at && {
      startsAt: new Date(mock.starts_at),
    }),
    ...(mock.unsubscribed_at && {
      unsubscribedAt: new Date(mock.unsubscribed_at),
    }),
    ...(mock.cancellation_reason && {
      cancellationReason: mock.cancellation_reason as CancellationReason,
    }),
    isActive: mock.is_active,
    isInGracePeriod: mock.is_in_grace_period,
    isLifetime: mock.is_lifetime,
    isRefund: mock.is_refund,
    isSandbox: mock.is_sandbox,
    store: mock.store as VendorStore,
    vendorOriginalTransactionId: mock.vendor_original_transaction_id,
    vendorProductId: mock.vendor_product_id,
    vendorTransactionId: mock.vendor_transaction_id,
    willRenew: mock.will_renew,
    ...(mock.offer_id && { offerId: mock.offer_id }),
    ...(mock.billing_plan_id && {
      billingPlan: mock.billing_plan_id as SubscriptionBillingPlan,
    }),
    ...(mock.commitment && {
      commitmentInfo: {
        billingPeriodNumber: mock.commitment.billing_period_number,
        totalBillingPeriods: mock.commitment.total_billing_periods,
        expiresAt: new Date(mock.commitment.expires_at),
      },
    }),
  };
}

describe('AdaptySubscriptionCoder', () => {
  let coder: AdaptySubscriptionCoder;

  beforeEach(() => {
    coder = new AdaptySubscriptionCoder(new DefaultPlatformAdapter());
  });

  it.each(mocks)('should decode to expected result', mock => {
    const decoded = coder.decode(mock);

    expect(decoded).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode', mock => {
    const decoded = coder.decode(mock);
    const encoded = coder.encode(decoded);

    expect(encoded).toStrictEqual(mock);
  });
});
