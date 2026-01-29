/**
 * Logger placeholder for platform-agnostic code
 * Actual logging implementation should be provided by the platform SDK
 */

export interface ScopeArgs {
  methodName: string;
}

interface Trace {
  action: string;
  fn: string;
  payload: Record<string, any>;
  error?: boolean;
  done?: boolean;
}

/**
 * LogScope provides methods for logging at different stages of execution
 */
export class LogScope {
  start(_payload?: Record<string, any>): void {
    // Noop - actual implementation provided by platform SDK
  }

  failed(_message?: string): void {
    // Noop - actual implementation provided by platform SDK
  }

  success(_payload?: Record<string, any>): void {
    // Noop - actual implementation provided by platform SDK
  }
}

/**
 * LogContext accumulates logs for each step of a call
 */
export class LogContext {
  public stack: Trace[] = [];

  decode(_args: ScopeArgs): LogScope {
    return new LogScope();
  }

  encode(_args: ScopeArgs): LogScope {
    return new LogScope();
  }

  call(_args: ScopeArgs): LogScope {
    return new LogScope();
  }

  bridge(_args: ScopeArgs): LogScope {
    return new LogScope();
  }

  event(_args: ScopeArgs): LogScope {
    return new LogScope();
  }
}
