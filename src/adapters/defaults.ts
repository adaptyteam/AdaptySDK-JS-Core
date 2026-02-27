import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
  ILoggerAdapter,
  ILogContext,
  PlatformOS,
} from './interfaces';
import { LogContext } from '@/logger';

/**
 * Default platform adapter with unknown OS
 */
export class DefaultPlatformAdapter implements IPlatformAdapter {
  readonly OS: PlatformOS = 'unknown';
}

/**
 * Default SDK metadata adapter
 */
export class DefaultSdkMetadataAdapter implements ISdkMetadataAdapter {
  constructor(
    public readonly sdkName: string = 'unknown',
    public readonly sdkVersion: string = '0.0.0',
  ) {}
}

/**
 * Default logger adapter using the real LogContext implementation
 */
export class DefaultLoggerAdapter implements ILoggerAdapter {
  createContext(): ILogContext {
    return new LogContext();
  }
}
