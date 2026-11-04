import { AdaptyError } from '@/adapty-error';
import {
  ErrorCode,
  ErrorCodeName,
  getErrorCode,
  getErrorCodeName,
  getErrorPrompt,
  isKnownErrorCode,
} from './error';

describe('error codes', () => {
  it('keeps ErrorCode and ErrorCodeName in sync', () => {
    const fromMapping = Object.entries(ErrorCode).map(
      ([code, name]) => [name, Number(code)] as const,
    );

    expect(Object.fromEntries(fromMapping)).toStrictEqual(ErrorCodeName);
  });

  it.each([
    [2, 'paymentCancelled'],
    [1020, 'fetchSubscriptionStatusFailed'],
    [1030, 'unknownTransactionId'],
    [1050, 'paymentPendingError'],
    [1060, 'billingPlanUnavailable'],
    [3020, 'unidentifiedUserLogout'],
    [4104, 'wrongAssetType'],
    [4105, 'jsException'],
    [4106, 'navigatorNotFound'],
    [4107, 'invalidActionUrl'],
  ] as const)('maps native code %i to %s', (code, name) => {
    expect(getErrorPrompt(code)).toBe(name);
    expect(getErrorCode(name)).toBe(code);
  });

  it('accepts a code unknown to this SDK version', () => {
    const error = new AdaptyError({ adaptyCode: 7777, message: 'New error' });

    expect(isKnownErrorCode(7777)).toBe(false);
    expect(getErrorCodeName(7777)).toBeUndefined();
    expect(getErrorPrompt(7777)).toBe('Unknown code: 7777');
    expect(error.adaptyCode === 7777).toBe(true);
    expect(error.codeName).toBeUndefined();
    expect(error.message).toBe('#7777 (unknown code): New error');
  });

  it('names a known code', () => {
    const error = new AdaptyError({ adaptyCode: 1060, message: 'Unavailable' });

    expect(isKnownErrorCode(1060)).toBe(true);
    expect(error.adaptyCode === ErrorCodeName.billingPlanUnavailable).toBe(
      true,
    );
    expect(error.codeName).toBe('billingPlanUnavailable');
    expect(error.message).toBe('#1060 (billingPlanUnavailable): Unavailable');
  });
});
