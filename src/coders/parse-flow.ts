import { AdaptyError } from '@/adapty-error';
import { LogContext } from '../logger';
import { ErrorConverter } from './error-coder';
import type { CoderFactory } from './factory';
import type { Converter } from './types';
import type {
  AdaptyPaywallProduct,
  AdaptyProfile,
  AdaptyPurchaseResult,
  WebPresentation,
} from '@/types';
import {
  FlowEventId,
  type FlowEventView,
  type ParsedFlowEvent,
  type FlowUserAction,
} from '@/types/flow-events';

// Re-export types for convenience
export {
  FlowEventId,
  type FlowEventIdType,
  type FlowEventView,
  type FlowDidAppearEvent,
  type FlowDidDisappearEvent,
  type FlowDidPerformActionEvent,
  type FlowUserAction,
  type FlowDidSelectProductEvent,
  type FlowDidStartPurchaseEvent,
  type FlowDidFinishPurchaseEvent,
  type FlowDidFailPurchaseEvent,
  type FlowDidStartRestoreEvent,
  type FlowDidFinishRestoreEvent,
  type FlowDidFailRestoreEvent,
  type FlowDidReceiveErrorEvent,
  type FlowDidFailLoadingProductsEvent,
  type FlowDidFinishWebPaymentNavigationEvent,
  type FlowDidRequestAppReviewEvent,
  type FlowDidReceiveAnalyticEvent,
  type FlowDidAskPermissionEvent,
  type FlowObserverDidInitiatePurchaseEvent,
  type FlowObserverDidInitiateRestoreEvent,
  type ParsedFlowEvent,
} from '@/types/flow-events';

// Parser
export function parseFlowEvent(
  factory: CoderFactory,
  input: string,
  ctx?: LogContext,
): ParsedFlowEvent | null {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(input);
  } catch (error) {
    throw AdaptyError.failedToDecode(
      `Failed to decode event: ${(error as Error)?.message}`,
    );
  }

  const eventId = obj['id'] as string | undefined;
  if (!eventId?.startsWith('flow_view_')) {
    return null;
  }

  const viewObj = obj['view'] as Record<string, unknown>;
  const view: FlowEventView = {
    id: viewObj['id'] as string,
    placementId: viewObj['placement_id'] as string | undefined,
    variationId: viewObj['variation_id'] as string | undefined,
  };

  switch (eventId) {
    case FlowEventId.DidAppear:
      return {
        id: eventId,
        view,
      };

    case FlowEventId.DidDisappear:
      return {
        id: eventId,
        view,
      };

    case FlowEventId.DidPerformAction: {
      const actionObj = obj['action'] as Record<string, unknown>;
      return {
        id: eventId,
        view,
        action: parseFlowUserAction(actionObj),
      };
    }

    case FlowEventId.DidSelectProduct:
      return {
        id: eventId,
        view,
        productId: (obj['product_id'] as string) ?? '',
      };

    case FlowEventId.DidStartPurchase:
      return {
        id: eventId,
        view,
        product: getFlowCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };

    case FlowEventId.DidFinishPurchase:
      return {
        id: eventId,
        view,
        purchaseResult: getFlowCoder(factory, 'purchaseResult', ctx)!.decode(
          obj['purchased_result'],
        ) as AdaptyPurchaseResult,
        product: getFlowCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };

    case FlowEventId.DidFailPurchase: {
      const errorCoder = getFlowCoder(
        factory,
        'error',
        ctx,
      ) as ErrorConverter<any>;
      const decodedError = errorCoder.decode(obj['error']);
      return {
        id: eventId,
        view,
        error: errorCoder.getError(decodedError),
        product: getFlowCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };
    }

    case FlowEventId.DidStartRestore:
      return {
        id: eventId,
        view,
      };

    case FlowEventId.DidFinishRestore:
      return {
        id: eventId,
        view,
        profile: getFlowCoder(factory, 'profile', ctx)!.decode(
          obj['profile'],
        ) as AdaptyProfile,
      };

    case FlowEventId.DidFailRestore: {
      const errorCoder = getFlowCoder(
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

    case FlowEventId.DidReceiveError: {
      const errorCoder = getFlowCoder(
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

    case FlowEventId.DidFailLoadingProducts: {
      const errorCoder = getFlowCoder(
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

    case FlowEventId.DidFinishWebPaymentNavigation:
      return {
        id: eventId,
        view,
        product: obj['product']
          ? (getFlowCoder(factory, 'product', ctx)!.decode(
              obj['product'],
            ) as AdaptyPaywallProduct)
          : undefined,
        error: obj['error']
          ? (() => {
              const errorCoder = getFlowCoder(
                factory,
                'error',
                ctx,
              ) as ErrorConverter<any>;
              const decodedError = errorCoder.decode(obj['error']);
              return errorCoder.getError(decodedError);
            })()
          : undefined,
      };

    case FlowEventId.DidRequestAppReview:
      return {
        id: eventId,
        view,
      };

    case FlowEventId.DidReceiveAnalyticEvent: {
      const params = obj['params'];
      return {
        id: eventId,
        view,
        name: typeof obj['name'] === 'string' ? obj['name'] : '',
        params:
          typeof params === 'object' && params !== null
            ? (params as Record<string, unknown>)
            : {},
      };
    }

    case FlowEventId.DidAskPermission:
      return {
        id: eventId,
        view,
        eventId: typeof obj['event_id'] === 'string' ? obj['event_id'] : '',
        permission:
          typeof obj['permission'] === 'string' ? obj['permission'] : '',
        customArgs:
          typeof obj['custom_args'] === 'object' && obj['custom_args'] !== null
            ? (obj['custom_args'] as Record<string, string>)
            : {},
      };

    case FlowEventId.ObserverDidInitiatePurchase:
      return {
        id: eventId,
        view,
        eventId: typeof obj['event_id'] === 'string' ? obj['event_id'] : '',
        product: getFlowCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };

    case FlowEventId.ObserverDidInitiateRestore:
      return {
        id: eventId,
        view,
        eventId: typeof obj['event_id'] === 'string' ? obj['event_id'] : '',
      };

    default:
      return null;
  }
}

function parseFlowUserAction(
  actionObj: Record<string, unknown>,
): FlowUserAction {
  const type = actionObj['type'] as FlowUserAction['type'];
  switch (type) {
    case 'open_url':
      return {
        type,
        value: actionObj['value'] as string,
        openIn: actionObj['open_in'] as WebPresentation,
      };
    case 'custom':
      return { type, value: actionObj['value'] as string };
    case 'close':
    case 'system_back':
      return { type };
  }
}

type FlowCoderType = 'product' | 'profile' | 'purchaseResult' | 'error';

function getFlowCoder(
  factory: CoderFactory,
  type: FlowCoderType,
  _ctx?: LogContext,
): Converter<any, any> | ErrorConverter<any> {
  switch (type) {
    case 'product':
      return factory.createPaywallProductCoder();
    case 'profile':
      return factory.createProfileCoder();
    case 'purchaseResult':
      return factory.createPurchaseResultCoder();
    case 'error':
      return factory.createNativeErrorCoder();
  }
}
