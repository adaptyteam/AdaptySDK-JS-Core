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
  PaywallEventId,
  type PaywallEventView,
  type ParsedPaywallEvent,
  type PaywallUserAction,
} from '@/types/paywall-events';

// Re-export types for convenience
export {
  PaywallEventId,
  type PaywallEventIdType,
  type PaywallEventView,
  type PaywallDidAppearEvent,
  type PaywallDidDisappearEvent,
  type PaywallDidPerformActionEvent,
  type PaywallUserAction,
  type PaywallDidSelectProductEvent,
  type PaywallDidStartPurchaseEvent,
  type PaywallDidFinishPurchaseEvent,
  type PaywallDidFailPurchaseEvent,
  type PaywallDidStartRestoreEvent,
  type PaywallDidFinishRestoreEvent,
  type PaywallDidFailRestoreEvent,
  type PaywallDidFailRenderingEvent,
  type PaywallDidFailLoadingProductsEvent,
  type PaywallDidFinishWebPaymentNavigationEvent,
  type ParsedPaywallEvent,
} from '@/types/paywall-events';

// Parser
export function parsePaywallEvent(
  factory: CoderFactory,
  input: string,
  ctx?: LogContext,
): ParsedPaywallEvent | null {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(input);
  } catch (error) {
    throw AdaptyError.failedToDecode(
      `Failed to decode event: ${(error as Error)?.message}`,
    );
  }

  const eventId = obj['id'] as string | undefined;
  if (!eventId?.startsWith('paywall_view_')) {
    return null;
  }

  const viewObj = obj['view'] as Record<string, unknown>;
  const view: PaywallEventView = {
    id: viewObj['id'] as string,
    placementId: viewObj['placement_id'] as string | undefined,
    variationId: viewObj['variation_id'] as string | undefined,
  };

  switch (eventId) {
    case PaywallEventId.DidAppear:
      return {
        id: eventId,
        view,
      };

    case PaywallEventId.DidDisappear:
      return {
        id: eventId,
        view,
      };

    case PaywallEventId.DidPerformAction: {
      const actionObj = obj['action'] as Record<string, unknown>;
      return {
        id: eventId,
        view,
        action: parsePaywallUserAction(actionObj),
      };
    }

    case PaywallEventId.DidSelectProduct:
      return {
        id: eventId,
        view,
        productId: (obj['product_id'] as string) ?? '',
      };

    case PaywallEventId.DidStartPurchase:
      return {
        id: eventId,
        view,
        product: getPaywallCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };

    case PaywallEventId.DidFinishPurchase:
      return {
        id: eventId,
        view,
        purchaseResult: getPaywallCoder(factory, 'purchaseResult', ctx)!.decode(
          obj['purchased_result'],
        ) as AdaptyPurchaseResult,
        product: getPaywallCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };

    case PaywallEventId.DidFailPurchase: {
      const errorCoder = getPaywallCoder(
        factory,
        'error',
        ctx,
      ) as ErrorConverter<any>;
      const decodedError = errorCoder.decode(obj['error']);
      return {
        id: eventId,
        view,
        error: errorCoder.getError(decodedError),
        product: getPaywallCoder(factory, 'product', ctx)!.decode(
          obj['product'],
        ) as AdaptyPaywallProduct,
      };
    }

    case PaywallEventId.DidStartRestore:
      return {
        id: eventId,
        view,
      };

    case PaywallEventId.DidFinishRestore:
      return {
        id: eventId,
        view,
        profile: getPaywallCoder(factory, 'profile', ctx)!.decode(
          obj['profile'],
        ) as AdaptyProfile,
      };

    case PaywallEventId.DidFailRestore: {
      const errorCoder = getPaywallCoder(
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

    case PaywallEventId.DidFailRendering: {
      const errorCoder = getPaywallCoder(
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

    case PaywallEventId.DidFailLoadingProducts: {
      const errorCoder = getPaywallCoder(
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

    case PaywallEventId.DidFinishWebPaymentNavigation:
      return {
        id: eventId,
        view,
        product: obj['product']
          ? (getPaywallCoder(factory, 'product', ctx)!.decode(
              obj['product'],
            ) as AdaptyPaywallProduct)
          : undefined,
        error: obj['error']
          ? (() => {
              const errorCoder = getPaywallCoder(
                factory,
                'error',
                ctx,
              ) as ErrorConverter<any>;
              const decodedError = errorCoder.decode(obj['error']);
              return errorCoder.getError(decodedError);
            })()
          : undefined,
      };

    default:
      return null;
  }
}

function parsePaywallUserAction(
  actionObj: Record<string, unknown>,
): PaywallUserAction {
  const type = actionObj['type'] as PaywallUserAction['type'];
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

type PaywallCoderType = 'product' | 'profile' | 'purchaseResult' | 'error';

function getPaywallCoder(
  factory: CoderFactory,
  type: PaywallCoderType,
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
