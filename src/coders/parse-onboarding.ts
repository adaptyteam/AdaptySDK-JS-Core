import { AdaptyError } from '@/adapty-error';
import { LogContext } from '../logger';
import { ErrorConverter } from './error-coder';
import type { CoderFactory } from './factory';
import type { Converter } from './types';
import type { AdaptyUiOnboardingMeta } from '@/ui/types';
import type { OnboardingStateUpdatedAction } from '@/ui/types';
import {
  OnboardingEventId,
  type OnboardingEventView,
  type ParsedOnboardingEvent,
} from '@/types/onboarding-events';

// Re-export types for convenience
export {
  OnboardingEventId,
  type OnboardingEventIdType,
  type OnboardingEventView,
  type OnboardingCloseEvent,
  type OnboardingCustomEvent,
  type OnboardingPaywallEvent,
  type OnboardingStateUpdatedEvent,
  type OnboardingFinishedLoadingEvent,
  type OnboardingAnalyticsEvent,
  type OnboardingErrorEvent,
  type ParsedOnboardingEvent,
} from '@/types/onboarding-events';

// Parser
export function parseOnboardingEvent(
  factory: CoderFactory,
  input: string,
  ctx?: LogContext,
): ParsedOnboardingEvent | null {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(input);
  } catch (error) {
    throw AdaptyError.failedToDecode(
      `Failed to decode event: ${(error as Error)?.message}`,
    );
  }

  const eventId = obj['id'] as string | undefined;
  if (!eventId?.startsWith('onboarding_')) {
    return null;
  }

  const viewObj = obj['view'] as Record<string, unknown>;
  const view: OnboardingEventView = {
    id: viewObj['id'] as string,
    placementId: viewObj['placement_id'] as string | undefined,
    variationId: viewObj['variation_id'] as string | undefined,
  };
  const decodeMeta = () =>
    getOnboardingCoder(factory, 'meta', ctx)!.decode(
      obj['meta'],
    ) as AdaptyUiOnboardingMeta;

  switch (eventId) {
    case OnboardingEventId.Close:
    case OnboardingEventId.Custom:
    case OnboardingEventId.Paywall:
      return {
        id: eventId,
        view,
        actionId: (obj['action_id'] as string) ?? '',
        meta: decodeMeta(),
      };

    case OnboardingEventId.StateUpdated:
      return {
        id: eventId,
        view,
        action: getOnboardingCoder(factory, 'action', ctx)!.decode(
          obj['action'],
        ) as OnboardingStateUpdatedAction,
        meta: decodeMeta(),
      };

    case OnboardingEventId.FinishedLoading:
      return {
        id: eventId,
        view,
        meta: decodeMeta(),
      };

    case OnboardingEventId.Analytics: {
      const eventObj = obj['event'] as Record<string, any>;
      return {
        id: eventId,
        view,
        event: {
          name: eventObj['name'] as string,
          elementId: eventObj['element_id'] as string | undefined,
          reply: eventObj['reply'] as string | undefined,
        },
        meta: decodeMeta(),
      };
    }

    case OnboardingEventId.Error: {
      const errorCoder = getOnboardingCoder(
        factory,
        'error',
        ctx,
      ) as ErrorConverter<any>;
      const decodedError = errorCoder.decode(obj['error']);
      return {
        id: eventId,
        view,
        error: errorCoder.getError(decodedError),
      };
    }

    default:
      return null;
  }
}

type OnboardingCoderType = 'meta' | 'action' | 'error';

function getOnboardingCoder(
  factory: CoderFactory,
  type: OnboardingCoderType,
  _ctx?: LogContext,
): Converter<any, any> | ErrorConverter<any> {
  switch (type) {
    case 'meta':
      return factory.createUiOnboardingMetaCoder();
    case 'action':
      return factory.createUiOnboardingStateUpdatedActionCoder();
    case 'error':
      return factory.createNativeErrorCoder();
  }
}
