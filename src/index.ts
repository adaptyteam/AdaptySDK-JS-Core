/**
 * @adapty/core - Platform-agnostic core for Adapty SDKs
 *
 * This is the main entry point for the library.
 * Add your exports here as you develop the SDK.
 */

export type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
  ILoggerAdapter,
  ILogContext,
  ILogScope,
  LogArgs,
  LogTrace,
  PlatformOS,
  ScopeArgs,
} from './adapters/interfaces';

export {
  DefaultPlatformAdapter,
  DefaultSdkMetadataAdapter,
  DefaultLoggerAdapter,
} from './adapters/defaults';

export { Log, LogContext, LogScope, consoleLogSink } from './logger';
export type { LogSink, LoggerConfig, LogEvent } from './logger';

export { AdaptyError } from './adapty-error';
export type { AdaptyErrorInput } from './adapty-error';
export { CoderFactory } from './coders/factory';
export type { CoderDependencies } from './coders/factory';
export type { Converter } from './coders/types';
export type { ErrorConverter } from './coders/error-coder';

// Mass re-export all types from types folder
export * from './types/index';
export * from './types/inputs';
export * from './types/error';
export * from './types/bridge';
export * from './types/paywall-events';
export * from './types/onboarding-events';

export type { components } from './types/api';

// UI event mappings
export * from './ui/paywall-event-mapping';
export * from './ui/onboarding-event-mapping';
export * from './ui/types';

// Parse functions (accept CoderFactory as first parameter)
export {
  parseMethodResult,
  parseCommonEvent,
  type AdaptyType,
} from './coders/parse';
export { parsePaywallEvent } from './coders/parse-paywall';
export { parseOnboardingEvent } from './coders/parse-onboarding';

export { generateId } from './utils/generate-id';
export { filterUndefined } from './utils/compact-object';
export { mapValues } from './utils/map-values';
export { mergeOptions } from './utils/merge-options';
export { withErrorContext } from './utils/with-error-context';
