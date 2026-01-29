/**
 * Platform detection and utilities for cross-platform code
 * This is a mock replacement for react-native Platform
 */

import type { PlatformOS } from '@/adapters/interfaces';

export class Platform {
  private static _os: PlatformOS = 'unknown';

  static get OS(): PlatformOS {
    return Platform._os;
  }

  static set OS(value: PlatformOS) {
    Platform._os = value;
  }
}

/**
 * EmitterSubscription mock for type compatibility
 */
export interface EmitterSubscription {
  remove(): void;
}
