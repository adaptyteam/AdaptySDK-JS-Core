import {
  ErrorCode,
  ErrorCodeName,
  getErrorCode,
  getErrorPrompt,
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
});
