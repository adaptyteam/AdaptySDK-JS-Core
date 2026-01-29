/**
 * Logger placeholder for platform-agnostic code
 * Actual logging implementation should be provided by the platform SDK
 */

import type {
  ILoggerAdapter,
  ILogContext,
  ILogScope,
  LogTrace,
  ScopeArgs,
} from '@/adapters/interfaces';

/**
 * LogScope provides methods for logging at different stages of execution
 */
export class LogScope implements ILogScope {
  start(_payload?: Record<string, unknown>): void {
    // Noop - actual implementation provided by platform SDK
  }

  failed(_message?: string): void {
    // Noop - actual implementation provided by platform SDK
  }

  success(_payload?: Record<string, unknown>): void {
    // Noop - actual implementation provided by platform SDK
  }
}

/**
 * LogContext accumulates logs for each step of a call
 */
export class LogContext implements ILogContext {
  public stack: LogTrace[] = [];

  decode(_args: ScopeArgs): ILogScope {
    return new LogScope();
  }

  encode(_args: ScopeArgs): ILogScope {
    return new LogScope();
  }

  call(_args: ScopeArgs): ILogScope {
    return new LogScope();
  }

  bridge(_args: ScopeArgs): ILogScope {
    return new LogScope();
  }

  event(_args: ScopeArgs): ILogScope {
    return new LogScope();
  }
}

/**
 * Noop logger adapter - doesn't log anything
 */
export class NoopLoggerAdapter implements ILoggerAdapter {
  createContext(): ILogContext {
    return new LogContext();
  }
}
