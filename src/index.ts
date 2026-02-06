/**
 * @adapty/core - Platform-agnostic core for Adapty SDKs
 *
 * This is the main entry point for the library.
 * Add your exports here as you develop the SDK.
 */

export const version = '0.0.0-dev.0000000000000000000000000000000000000000';

export type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
  ILoggerAdapter,
  ILogContext,
  ILogScope,
  LogTrace,
  PlatformOS,
  ScopeArgs,
} from './adapters/interfaces';

export {
  DefaultPlatformAdapter,
  DefaultSdkMetadataAdapter,
  DefaultLoggerAdapter,
} from './adapters/defaults';

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
