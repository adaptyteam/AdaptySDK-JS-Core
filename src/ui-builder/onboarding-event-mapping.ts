import type { OnboardingEventHandlers } from './types';
import { OnboardingEventId } from '@/types/onboarding-events';
import type {
  OnboardingEventIdType,
  ParsedOnboardingEvent,
} from '@/types/onboarding-events';

type EventName = keyof OnboardingEventHandlers;

/**
 * Keyed by {@link OnboardingEventIdType} rather than `string`, so an id that is
 * not a real onboarding event cannot be mapped and a newly added one cannot be
 * forgotten. This is what lets {@link HANDLER_TO_EVENT_CONFIG} expose
 * `nativeEvent` as a checked id instead of a bare string.
 */
type UiEventMapping = Record<
  OnboardingEventIdType,
  {
    handlerName: keyof OnboardingEventHandlers;
    propertyMap?: {
      [key: string]: string;
    };
  }[]
>;

export const ONBOARDING_EVENT_MAPPINGS: UiEventMapping = {
  onboarding_on_close_action: [
    {
      handlerName: 'onClose',
    },
  ],
  onboarding_on_custom_action: [
    {
      handlerName: 'onCustom',
    },
  ],
  onboarding_on_paywall_action: [
    {
      handlerName: 'onPaywall',
    },
  ],
  onboarding_on_state_updated_action: [
    {
      handlerName: 'onStateUpdated',
    },
  ],
  onboarding_did_finish_loading: [
    {
      handlerName: 'onFinishedLoading',
    },
  ],
  onboarding_on_analytics_action: [
    {
      handlerName: 'onAnalytics',
    },
  ],
  onboarding_did_fail_with_error: [
    {
      handlerName: 'onError',
    },
  ],
};

export const HANDLER_TO_EVENT_CONFIG: Record<
  keyof OnboardingEventHandlers,
  {
    nativeEvent: OnboardingEventIdType;
    handlerName: keyof OnboardingEventHandlers;
  }
> = Object.entries(ONBOARDING_EVENT_MAPPINGS).reduce(
  (acc, [nativeEvent, mappings]) => {
    mappings.forEach(({ handlerName }) => {
      acc[handlerName] = {
        // Object.entries widens the key to `string`; UiEventMapping already
        // constrains it, so the narrowing is a restatement, not an assumption.
        nativeEvent: nativeEvent as OnboardingEventIdType,
        handlerName,
      };
    });
    return acc;
  },
  {} as Record<
    keyof OnboardingEventHandlers,
    {
      nativeEvent: OnboardingEventIdType;
      handlerName: keyof OnboardingEventHandlers;
    }
  >,
);

// Reverse mapping: nativeEvent -> EventName[]
export const NATIVE_EVENT_TO_HANDLERS: Record<string, EventName[]> =
  Object.entries(HANDLER_TO_EVENT_CONFIG).reduce(
    (acc, [handlerName, config]) => {
      if (!acc[config.nativeEvent]) {
        acc[config.nativeEvent] = [];
      }
      const handlers = acc[config.nativeEvent];
      if (handlers) {
        handlers.push(handlerName as EventName);
      }
      return acc;
    },
    {} as Record<string, EventName[]>,
  );

type ExtractedArgs<T extends keyof OnboardingEventHandlers> = Parameters<
  OnboardingEventHandlers[T]
>;

export function extractOnboardingCallbackArgs<
  T extends keyof OnboardingEventHandlers,
>(_handlerName: T, event: ParsedOnboardingEvent): ExtractedArgs<T> {
  switch (event.id) {
    case OnboardingEventId.Close:
    case OnboardingEventId.Custom:
    case OnboardingEventId.Paywall:
      return [event.actionId, event.meta] as ExtractedArgs<T>;

    case OnboardingEventId.StateUpdated:
      return [event.action, event.meta] as ExtractedArgs<T>;

    case OnboardingEventId.FinishedLoading:
      return [event.meta] as ExtractedArgs<T>;

    case OnboardingEventId.Analytics:
      return [
        {
          ...event.event,
          // Add backward compatibility: populate element_id from elementId
          element_id: event.event.elementId,
        },
        event.meta,
      ] as ExtractedArgs<T>;

    case OnboardingEventId.Error:
      return [event.error] as ExtractedArgs<T>;
  }
}
