/**
 * Platform detection and utilities for cross-platform code
 * This is a mock replacement for react-native Platform
 */

export type PlatformOS = 'ios' | 'android' | 'web' | 'unknown';

export interface PlatformSelectSpec<T> {
  ios?: T;
  android?: T;
  native?: T;
  default?: T;
  web?: T;
}

export class Platform {
  private static _os: PlatformOS = 'unknown';

  static get OS(): PlatformOS {
    return Platform._os;
  }

  static set OS(value: PlatformOS) {
    Platform._os = value;
  }

  static select<T>(spec: PlatformSelectSpec<T>): T | undefined {
    const platform = Platform.OS;

    // First, try to find exact platform match
    if (platform in spec) {
      return spec[platform as keyof typeof spec];
    }

    // For native platforms (ios/android), try native fallback
    if (platform === 'ios' || platform === 'android') {
      if ('native' in spec) {
        return spec.native;
      }
    }

    // Try default if available
    if ('default' in spec) {
      return spec.default;
    }

    // If OS is unknown, prefer ios over android as fallback
    if (platform === 'unknown') {
      if ('ios' in spec) return spec.ios;
      if ('android' in spec) return spec.android;
      if ('native' in spec) return spec.native;
    }

    return undefined;
  }
}

/**
 * EmitterSubscription mock for type compatibility
 */
export interface EmitterSubscription {
  remove(): void;
}
