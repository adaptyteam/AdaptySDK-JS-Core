/** JSON value allowed inside an {@link AdaptyFlowMessage}. */
export type AdaptyFlowMessageValue =
  | string
  | number
  | boolean
  | null
  | AdaptyFlowMessage
  | readonly AdaptyFlowMessageValue[];

/**
 * Message exchanged with the flow script: a JSON object, delivered to the
 * script as the content of an SDK event.
 * Use finite numbers, omit unset properties or use `null`, avoid cycles.
 */
export type AdaptyFlowMessage = {
  readonly [key: string]: AdaptyFlowMessageValue;
};
