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

export { CoderFactory } from './coders/factory';
export type { CoderDependencies } from './coders/factory';
