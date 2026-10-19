import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
} from '@/adapters/interfaces';
import type { Def } from '@/types/schema';
import { ArrayCoder } from './array';
import { CoderFactory } from './factory';

const sdkMetadata: ISdkMetadataAdapter = {
  sdkName: 'test',
  sdkVersion: '0.0.0',
};

function createFactory(platform: IPlatformAdapter): CoderFactory {
  return new CoderFactory({ platform, sdkMetadata });
}

const androidProduct: Def['AdaptyPaywallProduct.Response'] = {
  vendor_product_id: 'yearly.premium',
  adapty_product_id: 'adapty_yearly',
  access_level_id: 'premium',
  product_type: 'subscription',
  paywall_product_index: 0,
  paywall_variation_id: 'variation1',
  paywall_ab_test_name: 'abTest1',
  paywall_name: 'Paywall',
  localized_description: 'Premium',
  localized_title: 'Premium Yearly',
  price: { amount: 69.99, localized_string: '$69.99' },
  subscription: {
    base_plan_id: 'yearly-base',
    renewal_type: 'autorenewable',
    period: { unit: 'year', number_of_units: 1 },
  },
};

const { base_plan_id: _basePlanId, ...subscriptionWithoutBasePlan } =
  androidProduct.subscription!;
const androidProductWithoutBasePlan: Def['AdaptyPaywallProduct.Response'] = {
  ...androidProduct,
  subscription: subscriptionWithoutBasePlan,
};

const iosProduct: Def['AdaptyPaywallProduct.Response'] = {
  ...androidProduct,
  is_family_shareable: false,
  subscription: {
    group_identifier: 'group1',
    period: { unit: 'year', number_of_units: 1 },
  },
};

describe('nested coders and the platform adapter', () => {
  describe('android.basePlanId in nested subscription details', () => {
    const android = createFactory({ OS: 'android' });

    it('should reject an Android product without base_plan_id', () => {
      expect(() =>
        android
          .createPaywallProductCoder()
          .decode(androidProductWithoutBasePlan),
      ).toThrow(/basePlanId/);
    });

    it('should reject the whole products array on Android', () => {
      expect(() =>
        android
          .createPaywallProductArrayCoder()
          .decode([androidProduct, androidProductWithoutBasePlan]),
      ).toThrow(/basePlanId/);
    });

    it('should decode an Android product with base_plan_id', () => {
      const decoded = android
        .createPaywallProductCoder()
        .decode(androidProduct);

      expect(decoded.subscription?.android).toStrictEqual({
        basePlanId: 'yearly-base',
        renewalType: 'autorenewable',
      });
    });

    it('should not require base_plan_id for iOS products on iOS', () => {
      const ios = createFactory({ OS: 'ios' });

      expect(() =>
        ios.createPaywallProductCoder().decode(iosProduct),
      ).not.toThrow();
    });

    it.each(['web', 'unknown'] as const)(
      'should keep platform checks off on %s',
      OS => {
        expect(() =>
          createFactory({ OS })
            .createPaywallProductCoder()
            .decode(androidProductWithoutBasePlan),
        ).not.toThrow();
      },
    );
  });

  describe('platform adapter sharing', () => {
    const platform: IPlatformAdapter = { OS: 'android' };
    const factory = createFactory(platform);
    const proto = CoderFactory.prototype as unknown as Record<
      string,
      (this: CoderFactory) => unknown
    >;
    const methods = Object.getOwnPropertyNames(CoderFactory.prototype).filter(
      name => name.startsWith('create') && proto[name]?.length === 0,
    );

    // Walks the object graph and returns every object that holds a `platform` field.
    // Coders created inside methods are not reachable here; the required constructor parameter covers them.
    function collectPlatformHolders(root: unknown): { platform: unknown }[] {
      const holders: { platform: unknown }[] = [];
      const seen = new Set<unknown>();
      const visit = (value: unknown): void => {
        if (value === null || typeof value !== 'object' || seen.has(value)) {
          return;
        }
        seen.add(value);
        if (value instanceof ArrayCoder) {
          const inner = value as unknown as { coderFactory: () => unknown };
          visit(inner.coderFactory());
        }
        if ('platform' in value) {
          holders.push(value as { platform: unknown });
        }
        Object.values(value).forEach(visit);
      };
      visit(root);
      return holders;
    }

    it('should find factory methods to check', () => {
      expect(methods.length).toBeGreaterThan(30);
    });

    it.each(methods)(
      '%s should pass the factory platform to every nested coder',
      name => {
        const holders = collectPlatformHolders(proto[name]!.call(factory));

        holders.forEach(holder => expect(holder.platform).toBe(platform));
      },
    );

    it('should reach nested coders of the paywall product', () => {
      const holders = collectPlatformHolders(
        factory.createPaywallProductCoder(),
      );

      // product, price, subscription details and their nested coders
      expect(holders.length).toBeGreaterThan(5);
    });
  });
});
