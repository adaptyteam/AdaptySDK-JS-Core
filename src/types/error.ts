// import SDK type to link to methods in docs.
// import { AdaptyError } from '../sdk2/error';

const ErrorCodeMapping = Object.freeze({
  /**
   * System StoreKit codes
   */
  0: 'unknown',
  /**
   * Client is not allowed to make a request, etc.
   */
  1: 'clientInvalid',
  /**
   * The user cancelled the payment request.
   */
  2: 'paymentCancelled',
  /**
   * Invalid purchase identifier, etc.
   */
  3: 'paymentInvalid',
  /**
   * This device is not allowed to make the payment.
   */
  4: 'paymentNotAllowed',
  /**
   * Product is not available in the current storefront.
   */
  5: 'storeProductNotAvailable',

  /**
   * User has not allowed access to cloud service information.
   */
  6: 'cloudServicePermissionDenied',

  /**
   * The device could not connect to the network.
   */
  7: 'cloudServiceNetworkConnectionFailed',

  /**
   * User has revoked permission to use this cloud service.
   */
  8: 'cloudServiceRevoked',

  /**
   * The user needs to acknowledge Apple's privacy policy.
   */
  9: 'privacyAcknowledgementRequired',

  /**
   * The app is attempting to use SKPayment's requestData property,
   * but does not have the appropriate entitlement.
   */
  10: 'unauthorizedRequestData',

  /**
   * The specified subscription offer identifier is not valid.
   */
  11: 'invalidOfferIdentifier',

  /**
   * The cryptographic signature provided is not valid.
   */
  12: 'invalidSignature',

  /**
   * One or more parameters from SKPaymentDiscount is missing.
   */
  13: 'missingOfferParams',

  14: 'invalidOfferPrice',

  /**
   * Custom Android codes.
   */
  20: 'adaptyNotInitialized',
  22: 'productNotFound',
  24: 'currentSubscriptionToUpdateNotFoundInHistory',
  97: 'billingServiceTimeout',
  98: 'featureNotSupported',
  99: 'billingServiceDisconnected',
  102: 'billingServiceUnavailable',
  103: 'billingUnavailable',
  105: 'developerError',
  106: 'billingError',
  107: 'itemAlreadyOwned',
  108: 'itemNotOwned',
  112: 'billingNetworkError',

  1000: 'noProductIDsFound',
  1002: 'productRequestFailed',

  /**
   * In-App Purchases are not allowed on this device.
   */
  1003: 'cantMakePayments',
  1004: 'noPurchasesToRestore',
  1005: 'cantReadReceipt',
  1006: 'productPurchaseFailed',
  1010: 'refreshReceiptFailed',
  1011: 'receiveRestoredTransactionsFailed',
  1020: 'fetchSubscriptionStatusFailed',
  1030: 'unknownTransactionId',
  /**
   * The payment is deferred, e.g. awaiting Ask to Buy approval.
   */
  1050: 'paymentPendingError',
  /**
   * The product doesn't offer the requested billing plan on this device
   * (e.g. a 12-month commitment plan below iOS 26.4). iOS only.
   */
  1060: 'billingPlanUnavailable',

  /**
   * You need to be authenticated to perform requests.
   */
  2002: 'notActivated',
  2003: 'badRequest',
  2004: 'serverError',
  2005: 'networkFailed',
  2006: 'decodingFailed',
  2009: 'encodingFailed',

  3000: 'analyticsDisabled',
  /**
   * Wrong parameter was passed.
   */
  3001: 'wrongParam',
  /**
   * It is not possible to call `.activate` method more than once.
   */
  3005: 'activateOnceError',
  /**
   * The user profile was changed during the operation.
   */
  3006: 'profileWasChanged',
  3007: 'unsupportedData',
  /**
   * `logout` was called for a user that was never identified.
   */
  3020: 'unidentifiedUserLogout',
  3100: 'persistingDataError',
  3101: 'fetchTimeoutError',
  /**
   * Another operation of the same kind is already in progress
   * (e.g. a store message show).
   */
  3201: 'operationInProgress',
  /**
   * A required resource could not be resolved
   * (e.g. no foreground-active window scene to show store messages).
   */
  3202: 'resolverFailure',
  /**
   * Custom Android AdaptyUI codes.
   */
  4104: 'wrongAssetType',
  4105: 'jsException',
  4106: 'navigatorNotFound',
  4107: 'invalidActionUrl',
  9000: 'operationInterrupted',
});

export const ErrorCode = ErrorCodeMapping;
/** A code known to this version of the SDK. */
export type KnownErrorCode = keyof typeof ErrorCodeMapping;
/**
 * Code of an {@link AdaptyError}.
 *
 * @remarks
 * Native SDKs may send codes this version doesn't know yet, so any number is accepted.
 * Known codes still autocomplete; use {@link isKnownErrorCode} to narrow.
 */
export type ErrorCode = KnownErrorCode | (number & {});

export const ErrorCodeName = Object.freeze({
  unknown: 0,
  clientInvalid: 1,
  paymentCancelled: 2,
  paymentInvalid: 3,
  paymentNotAllowed: 4,
  storeProductNotAvailable: 5,
  cloudServicePermissionDenied: 6,
  cloudServiceNetworkConnectionFailed: 7,
  cloudServiceRevoked: 8,
  privacyAcknowledgementRequired: 9,
  unauthorizedRequestData: 10,
  invalidOfferIdentifier: 11,
  invalidSignature: 12,
  missingOfferParams: 13,
  invalidOfferPrice: 14,
  adaptyNotInitialized: 20,
  productNotFound: 22,
  currentSubscriptionToUpdateNotFoundInHistory: 24,
  billingServiceTimeout: 97,
  featureNotSupported: 98,
  billingServiceDisconnected: 99,
  billingServiceUnavailable: 102,
  billingUnavailable: 103,
  developerError: 105,
  billingError: 106,
  itemAlreadyOwned: 107,
  itemNotOwned: 108,
  billingNetworkError: 112,
  noProductIDsFound: 1000,
  productRequestFailed: 1002,
  cantMakePayments: 1003,
  noPurchasesToRestore: 1004,
  cantReadReceipt: 1005,
  productPurchaseFailed: 1006,
  refreshReceiptFailed: 1010,
  receiveRestoredTransactionsFailed: 1011,
  fetchSubscriptionStatusFailed: 1020,
  unknownTransactionId: 1030,
  paymentPendingError: 1050,
  billingPlanUnavailable: 1060,
  notActivated: 2002,
  badRequest: 2003,
  serverError: 2004,
  networkFailed: 2005,
  decodingFailed: 2006,
  encodingFailed: 2009,
  analyticsDisabled: 3000,
  wrongParam: 3001,
  activateOnceError: 3005,
  profileWasChanged: 3006,
  unsupportedData: 3007,
  unidentifiedUserLogout: 3020,
  persistingDataError: 3100,
  fetchTimeoutError: 3101,
  operationInProgress: 3201,
  resolverFailure: 3202,
  wrongAssetType: 4104,
  jsException: 4105,
  navigatorNotFound: 4106,
  invalidActionUrl: 4107,
  operationInterrupted: 9000,
} as const);
export type ErrorCodeName = keyof typeof ErrorCodeName;

export function isKnownErrorCode(code: number): code is KnownErrorCode {
  return Object.prototype.hasOwnProperty.call(ErrorCodeMapping, code);
}

/** Returns the name of a code, or `undefined` for a code unknown to this SDK version. */
export function getErrorCodeName(code: number): ErrorCodeName | undefined {
  return isKnownErrorCode(code) ? ErrorCodeMapping[code] : undefined;
}

export function getErrorCode(error: ErrorCodeName): KnownErrorCode | undefined {
  const errorCode = Object.keys(ErrorCode).find(keyStr => {
    const key = Number(keyStr) as KnownErrorCode;
    return ErrorCode[key] === error;
  });

  if (!errorCode) {
    return undefined;
  }

  return Number(errorCode) as KnownErrorCode;
}

export function getErrorPrompt(
  code: ErrorCode,
): ErrorCodeName | `Unknown code: ${number}` {
  return getErrorCodeName(code) ?? `Unknown code: ${code}`;
}
