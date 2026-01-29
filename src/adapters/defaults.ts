import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
  PlatformOS,
} from './interfaces';
import { Platform } from '@/platform';
import { NoopLoggerAdapter } from '@/logger';

/**
 * Default platform adapter with unknown OS
 */
export class DefaultPlatformAdapter implements IPlatformAdapter {
  get OS(): PlatformOS {
    return Platform.OS;
  }

  set OS(value: PlatformOS) {
    Platform.OS = value;
  }
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

export { NoopLoggerAdapter as DefaultLoggerAdapter };
