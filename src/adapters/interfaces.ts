export type PlatformOS = 'ios' | 'android' | 'web' | 'unknown';

/**
 * Platform adapter interface for OS-specific behavior
 */
export interface IPlatformAdapter {
  /**
   * Current platform OS
   */
  readonly OS: PlatformOS;
}

/**
 * SDK metadata adapter for version and SDK name
 */
export interface ISdkMetadataAdapter {
  /**
   * SDK name (e.g., 'react-native', 'capacitor')
   */
  readonly sdkName: string;
  /**
   * SDK version string
   */
  readonly sdkVersion: string;
}

/**
 * Logger adapter interface for platform-specific logging
 */
export interface ILoggerAdapter {
  /**
   * Create logging context for method execution
   */
  createContext(): ILogContext;
}

export interface ScopeArgs {
  methodName: string;
}

export interface LogTrace {
  action: string;
  fn: string;
  payload: Record<string, unknown>;
  error?: boolean;
  done?: boolean;
}

/**
 * Log context interface for tracking method execution
 */
export interface ILogContext {
  readonly stack: LogTrace[];

  decode(args: ScopeArgs): ILogScope;
  encode(args: ScopeArgs): ILogScope;
  call(args: ScopeArgs): ILogScope;
  bridge(args: ScopeArgs): ILogScope;
  event(args: ScopeArgs): ILogScope;
}

/**
 * Log scope interface for logging at execution stages
 */
export interface ILogScope {
  start(payload?: Record<string, unknown>): void;
  failed(message?: string): void;
  success(payload?: Record<string, unknown>): void;
}
