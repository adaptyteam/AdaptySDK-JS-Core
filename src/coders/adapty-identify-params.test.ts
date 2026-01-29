import type { IPlatformAdapter, PlatformOS } from '@/adapters/interfaces';
import { AdaptyIdentifyParamsCoder } from '@/coders/adapty-identify-params';

describe('AdaptyIdentifyParamsCoder', () => {
  const createCoder = (OS: PlatformOS = 'ios') =>
    new AdaptyIdentifyParamsCoder({ OS } as IPlatformAdapter);

  it('should return undefined for empty params', () => {
    const coder = createCoder();
    const result = coder.encode({});
    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined params', () => {
    const coder = createCoder();
    const result = coder.encode(undefined);
    expect(result).toBeUndefined();
  });

  it('should encode iOS app account token on iOS platform', () => {
    const coder = createCoder('ios');

    const params = {
      ios: {
        appAccountToken: 'ios-token-123',
      },
    };

    const result = coder.encode(params);
    expect(result).toEqual({
      app_account_token: 'ios-token-123',
    });
  });

  it('should encode Android obfuscated account ID on Android platform', () => {
    const coder = createCoder('android');

    const params = {
      android: {
        obfuscatedAccountId: 'android-id-456',
      },
    };

    const result = coder.encode(params);
    expect(result).toEqual({
      obfuscated_account_id: 'android-id-456',
    });
  });

  it('should only encode iOS parameters when on iOS platform', () => {
    const coder = createCoder('ios');

    const params = {
      ios: {
        appAccountToken: 'ios-token-123',
      },
      android: {
        obfuscatedAccountId: 'android-id-456',
      },
    };

    const result = coder.encode(params);
    expect(result).toEqual({
      app_account_token: 'ios-token-123',
    });
  });

  it('should only encode Android parameters when on Android platform', () => {
    const coder = createCoder('android');

    const params = {
      ios: {
        appAccountToken: 'ios-token-123',
      },
      android: {
        obfuscatedAccountId: 'android-id-456',
      },
    };

    const result = coder.encode(params);
    expect(result).toEqual({
      obfuscated_account_id: 'android-id-456',
    });
  });

  it('should ignore iOS parameters on Android platform', () => {
    const coder = createCoder('android');

    const params = {
      ios: {
        appAccountToken: 'ios-token-123',
      },
    };

    const result = coder.encode(params);
    expect(result).toBeUndefined();
  });

  it('should ignore Android parameters on iOS platform', () => {
    const coder = createCoder('ios');

    const params = {
      android: {
        obfuscatedAccountId: 'android-id-456',
      },
    };

    const result = coder.encode(params);
    expect(result).toBeUndefined();
  });

  it('should handle empty platform objects', () => {
    const coder = createCoder('ios');

    const params = {
      ios: {},
      android: {},
    };

    const result = coder.encode(params);
    expect(result).toBeUndefined();
  });
});
