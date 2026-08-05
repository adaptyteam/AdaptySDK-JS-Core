import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
} from '@/adapters/interfaces';
import { AdaptyError } from '@/adapty-error';
import { CoderFactory } from './factory';
import { parseCommonEvent, parseMethodResult, type AdaptyType } from './parse';

function createFactory(): CoderFactory {
  return new CoderFactory({
    platform: { OS: 'ios' } as IPlatformAdapter,
    sdkMetadata: {
      sdkName: 'test',
      sdkVersion: '0.0.0',
    } as ISdkMetadataAdapter,
  });
}

// Replace a factory create*Coder method with a stub coder whose decode()
// returns a sentinel, so routing can be asserted without knowing each
// coder's real payload shape (those are covered by each coder's own test).
function stubCoder(
  factory: CoderFactory,
  method: keyof CoderFactory,
  decoded: unknown,
) {
  const decode = jest.fn().mockReturnValue(decoded);
  const spy = jest
    .spyOn(factory, method as any)
    .mockReturnValue({ decode } as any);
  return { decode, spy };
}

describe('parseMethodResult', () => {
  let factory: CoderFactory;

  beforeEach(() => {
    factory = createFactory();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('invalid input', () => {
    it('throws AdaptyError on malformed JSON', () => {
      expect.assertions(3);
      try {
        parseMethodResult(factory, '{ not json', 'String');
      } catch (e) {
        const err = e as AdaptyError;
        expect(err).toBeInstanceOf(AdaptyError);
        expect(err.adaptyCode).toBe(2006);
        expect(err.localizedDescription).toContain(
          'JSON.parse raised an error',
        );
      }
    });

    it('throws when neither "success" nor "error" is present', () => {
      expect.assertions(3);
      try {
        parseMethodResult(factory, JSON.stringify({ foo: 1 }), 'String');
      } catch (e) {
        const err = e as AdaptyError;
        expect(err).toBeInstanceOf(AdaptyError);
        expect(err.adaptyCode).toBe(2006);
        expect(err.localizedDescription).toContain('does not have expected');
      }
    });
  });

  describe('primitive result types are returned as-is (no coder)', () => {
    it('returns a String value untouched', () => {
      const result = parseMethodResult(
        factory,
        JSON.stringify({ success: 'hello' }),
        'String',
      );
      expect(result).toBe('hello');
    });

    it('returns Boolean false (presence of key, not truthiness)', () => {
      const result = parseMethodResult(
        factory,
        JSON.stringify({ success: false }),
        'Boolean',
      );
      expect(result).toBe(false);
    });

    it('returns null for a Void result', () => {
      const result = parseMethodResult(
        factory,
        JSON.stringify({ success: null }),
        'Void',
      );
      expect(result).toBeNull();
    });

    it('returns AdaptyUiView payload without decoding', () => {
      const view = { id: 'view-1', some: 'opaque' };
      const result = parseMethodResult(
        factory,
        JSON.stringify({ success: view }),
        'AdaptyUiView',
      );
      expect(result).toEqual(view);
    });

    it('returns AdaptyUiDialogActionType payload without decoding', () => {
      const result = parseMethodResult(
        factory,
        JSON.stringify({ success: 'primary' }),
        'AdaptyUiDialogActionType',
      );
      expect(result).toBe('primary');
    });
  });

  describe('success is routed to the matching coder', () => {
    const routing: { type: AdaptyType; method: keyof CoderFactory }[] = [
      { type: 'AdaptyProfile', method: 'createProfileCoder' },
      { type: 'AdaptyFlow', method: 'createFlowCoder' },
      { type: 'AdaptyPaywallProduct', method: 'createPaywallProductCoder' },
      { type: 'AdaptyPromotedProduct', method: 'createPromotedProductCoder' },
      { type: 'AdaptyRemoteConfig', method: 'createRemoteConfigCoder' },
      { type: 'AdaptyOnboarding', method: 'createOnboardingCoder' },
      { type: 'AdaptyPurchaseResult', method: 'createPurchaseResultCoder' },
      {
        type: 'AdaptyInstallationStatus',
        method: 'createInstallationStatusCoder',
      },
      {
        type: 'AdaptyInstallationDetails',
        method: 'createInstallationDetailsCoder',
      },
      {
        type: 'AdaptyUiOnboardingMeta',
        method: 'createUiOnboardingMetaCoder',
      },
      {
        type: 'AdaptyUiOnboardingStateParams',
        method: 'createUiOnboardingStateParamsCoder',
      },
      {
        type: 'AdaptyUiOnboardingStateUpdatedAction',
        method: 'createUiOnboardingStateUpdatedActionCoder',
      },
      { type: 'BridgeError', method: 'createBridgeErrorCoder' },
      {
        type: 'Array<AdaptyPaywallProduct>',
        method: 'createPaywallProductArrayCoder',
      },
    ];

    it.each(routing)(
      'routes $type to factory.$method and returns the decoded value',
      ({ type, method }) => {
        const payload = { raw: 'payload' };
        const sentinel = { decoded: true };
        const { decode, spy } = stubCoder(factory, method, sentinel);

        const result = parseMethodResult(
          factory,
          JSON.stringify({ success: payload }),
          type,
        );

        expect(spy).toHaveBeenCalledTimes(1);
        expect(decode).toHaveBeenCalledWith(payload);
        expect(result).toBe(sentinel);
      },
    );
  });

  describe('error branch', () => {
    it('throws an AdaptyError built from the decoded error payload', () => {
      expect.assertions(4);
      const input = JSON.stringify({
        error: {
          adapty_code: 3,
          message: 'Payment invalid',
          detail: 'extra detail',
        },
      });

      try {
        parseMethodResult(factory, input, 'AdaptyProfile');
      } catch (e) {
        const err = e as AdaptyError;
        expect(err).toBeInstanceOf(AdaptyError);
        expect(err.adaptyCode).toBe(3);
        expect(err.localizedDescription).toBe('Payment invalid');
        expect(err.detail).toBe('extra detail');
      }
    });

    it('prefers the error branch over the result type coder', () => {
      // Even for a complex resultType, an "error" payload must throw and
      // must not attempt to decode a success value.
      const profileSpy = jest.spyOn(factory, 'createProfileCoder');
      const input = JSON.stringify({
        error: { adapty_code: 1, message: 'Client invalid' },
      });

      expect(() => parseMethodResult(factory, input, 'AdaptyProfile')).toThrow(
        AdaptyError,
      );
      expect(profileSpy).not.toHaveBeenCalled();
    });
  });

  describe('unknown result type', () => {
    it('throws AdaptyError when the result type has no coder mapping', () => {
      expect.assertions(3);
      try {
        parseMethodResult(
          factory,
          JSON.stringify({ success: {} }),
          'NonExistentType' as AdaptyType,
        );
      } catch (e) {
        const err = e as AdaptyError;
        expect(err).toBeInstanceOf(AdaptyError);
        expect(err.adaptyCode).toBe(2006);
        expect(err.localizedDescription).toContain(
          'unexpected "type" property',
        );
      }
    });
  });
});

describe('parseCommonEvent', () => {
  let factory: CoderFactory;

  beforeEach(() => {
    factory = createFactory();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws AdaptyError on malformed JSON', () => {
    expect.assertions(3);
    try {
      parseCommonEvent(factory, 'did_load_latest_profile', '{ bad');
    } catch (e) {
      const err = e as AdaptyError;
      expect(err).toBeInstanceOf(AdaptyError);
      expect(err.adaptyCode).toBe(2006);
      expect(err.localizedDescription).toContain('Failed to decode event');
    }
  });

  it('returns null for an unknown event', () => {
    const result = parseCommonEvent(
      factory,
      'some_unknown_event',
      JSON.stringify({}),
    );
    expect(result).toBeNull();
  });

  it('decodes the profile for did_load_latest_profile', () => {
    const profile = { customer_user_id: 'user-1' };
    const sentinel = { id: 'profile' };
    const { decode } = stubCoder(factory, 'createProfileCoder', sentinel);

    const result = parseCommonEvent(
      factory,
      'did_load_latest_profile',
      JSON.stringify({ profile }),
    );

    expect(decode).toHaveBeenCalledWith(profile);
    expect(result).toBe(sentinel);
  });

  it('decodes the product for did_receive_promoted_purchase', () => {
    const product = { vendor_product_id: 'yearly.premium.6999' };
    const sentinel = { id: 'promoted-product' };
    const { decode } = stubCoder(
      factory,
      'createPromotedProductCoder',
      sentinel,
    );

    const result = parseCommonEvent(
      factory,
      'did_receive_promoted_purchase',
      JSON.stringify({ product }),
    );

    expect(decode).toHaveBeenCalledWith(product);
    expect(result).toBe(sentinel);
  });

  it('decodes the details for on_installation_details_success', () => {
    const details = { install_id: 'install-1' };
    const sentinel = { id: 'details' };
    const { decode } = stubCoder(
      factory,
      'createInstallationDetailsCoder',
      sentinel,
    );

    const result = parseCommonEvent(
      factory,
      'on_installation_details_success',
      JSON.stringify({ details }),
    );

    expect(decode).toHaveBeenCalledWith(details);
    expect(result).toBe(sentinel);
  });

  it('decodes (and returns, not throws) the error for on_installation_details_fail', () => {
    const error = { adapty_code: 1, message: 'Client invalid' };
    const sentinel = { adaptyCode: 1, message: 'Client invalid' };
    const { decode } = stubCoder(factory, 'createNativeErrorCoder', sentinel);

    const result = parseCommonEvent(
      factory,
      'on_installation_details_fail',
      JSON.stringify({ error }),
    );

    expect(decode).toHaveBeenCalledWith(error);
    expect(result).toBe(sentinel);
  });
});
