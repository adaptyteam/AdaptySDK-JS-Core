function toJSON(this: Error & { originalError: unknown }) {
  return {
    message: this.message,
    name: this.name,
    stack: this.stack,
    originalError:
      this.originalError instanceof Error
        ? {
            message: this.originalError.message,
            name: this.originalError.name,
          }
        : this.originalError,
  };
}
/**
 * Wraps a user-provided callback with error context enrichment.
 * Catches exceptions and wraps them with source and handler information.
 */
export function withErrorContext<T extends (...args: never[]) => unknown>(
  callback: T,
  handlerName: string,
  source: string,
): T {
  const wrapped = function (
    this: unknown,
    ...args: Parameters<T>
  ): ReturnType<T> {
    try {
      return callback.apply(this, args) as ReturnType<T>;
    } catch (error) {
      const message = `Unhandled exception in user's handler in ${source}.${handlerName}`;

      const wrappedError = new Error(message) as Error & {
        originalError: unknown;
        toJSON: typeof toJSON;
      };
      wrappedError.originalError = error;
      wrappedError.toJSON = toJSON;

      throw wrappedError;
    }
  };

  return wrapped as T;
}
