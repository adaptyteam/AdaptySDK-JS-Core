import type { FlowEventHandlers } from './types';
import { FlowEventId } from '@/types/flow-events';
import type { ParsedFlowEvent, FlowEventIdType } from '@/types/flow-events';

type EventName = keyof FlowEventHandlers;

/**
 * Resolves native event to handler name based on event data
 */
export const NATIVE_EVENT_RESOLVER: Record<
  FlowEventIdType,
  (event: ParsedFlowEvent) => EventName | null
> = {
  [FlowEventId.DidPerformAction]: event => {
    if (event.id !== FlowEventId.DidPerformAction) return null;

    const actionMap: Record<string, EventName> = {
      close: 'onCloseButtonPress',
      system_back: 'onAndroidSystemBack',
      open_url: 'onUrlPress',
      custom: 'onCustomAction',
    };

    return actionMap[event.action.type] || null;
  },
  [FlowEventId.DidAppear]: () => 'onAppeared',
  [FlowEventId.DidDisappear]: () => 'onDisappeared',
  [FlowEventId.DidSelectProduct]: () => 'onProductSelected',
  [FlowEventId.DidStartPurchase]: () => 'onPurchaseStarted',
  [FlowEventId.DidFinishPurchase]: () => 'onPurchaseCompleted',
  [FlowEventId.DidFailPurchase]: () => 'onPurchaseFailed',
  [FlowEventId.DidStartRestore]: () => 'onRestoreStarted',
  [FlowEventId.DidFinishRestore]: () => 'onRestoreCompleted',
  [FlowEventId.DidFailRestore]: () => 'onRestoreFailed',
  [FlowEventId.DidReceiveError]: () => 'onError',
  [FlowEventId.DidFailLoadingProducts]: () => 'onLoadingProductsFailed',
  [FlowEventId.DidFinishWebPaymentNavigation]: () =>
    'onWebPaymentNavigationFinished',
  [FlowEventId.DidRequestAppReview]: () => 'onRequestAppReview',
  [FlowEventId.DidReceiveAnalyticEvent]: () => 'onAnalytics',
  [FlowEventId.DidAskPermission]: () => 'onRequestPermission',
  [FlowEventId.ObserverDidInitiatePurchase]: () =>
    'onObserverPurchaseInitiated',
  [FlowEventId.ObserverDidInitiateRestore]: () => 'onObserverRestoreInitiated',
};

/**
 * Maps handler name to native event name
 * Used in addListener/addInternalListener to subscribe to correct native event
 */
export const HANDLER_TO_NATIVE_EVENT: Record<EventName, FlowEventIdType> = {
  onCloseButtonPress: FlowEventId.DidPerformAction,
  onAndroidSystemBack: FlowEventId.DidPerformAction,
  onUrlPress: FlowEventId.DidPerformAction,
  onCustomAction: FlowEventId.DidPerformAction,
  onAppeared: FlowEventId.DidAppear,
  onDisappeared: FlowEventId.DidDisappear,
  onProductSelected: FlowEventId.DidSelectProduct,
  onPurchaseStarted: FlowEventId.DidStartPurchase,
  onPurchaseCompleted: FlowEventId.DidFinishPurchase,
  onPurchaseFailed: FlowEventId.DidFailPurchase,
  onRestoreStarted: FlowEventId.DidStartRestore,
  onRestoreCompleted: FlowEventId.DidFinishRestore,
  onRestoreFailed: FlowEventId.DidFailRestore,
  onError: FlowEventId.DidReceiveError,
  onLoadingProductsFailed: FlowEventId.DidFailLoadingProducts,
  onWebPaymentNavigationFinished: FlowEventId.DidFinishWebPaymentNavigation,
  onRequestAppReview: FlowEventId.DidRequestAppReview,
  onAnalytics: FlowEventId.DidReceiveAnalyticEvent,
  onRequestPermission: FlowEventId.DidAskPermission,
  onObserverPurchaseInitiated: FlowEventId.ObserverDidInitiatePurchase,
  onObserverRestoreInitiated: FlowEventId.ObserverDidInitiateRestore,
};

type ExtractedArgs<T extends keyof FlowEventHandlers> = Parameters<
  FlowEventHandlers[T]
>;

export function extractFlowCallbackArgs<T extends keyof FlowEventHandlers>(
  handlerName: T,
  event: ParsedFlowEvent,
): ExtractedArgs<T> {
  switch (event.id) {
    case FlowEventId.DidSelectProduct:
      return [event.productId] as ExtractedArgs<T>;

    case FlowEventId.DidStartPurchase:
      return [event.product] as ExtractedArgs<T>;

    case FlowEventId.DidFinishPurchase:
      return [event.purchaseResult, event.product] as ExtractedArgs<T>;

    case FlowEventId.DidFailPurchase:
      return [event.error, event.product] as ExtractedArgs<T>;

    case FlowEventId.DidFinishRestore:
      return [event.profile] as ExtractedArgs<T>;

    case FlowEventId.DidFailRestore:
    case FlowEventId.DidReceiveError:
    case FlowEventId.DidFailLoadingProducts:
      return [event.error] as ExtractedArgs<T>;

    case FlowEventId.DidPerformAction:
      // For DidPerformAction, different handlers need different arguments
      if (handlerName === 'onUrlPress' && event.action.type === 'open_url') {
        return [event.action.value, event.action.openIn] as ExtractedArgs<T>;
      }
      if (handlerName === 'onCustomAction' && event.action.type === 'custom') {
        return [event.action.value] as ExtractedArgs<T>;
      }
      // onCloseButtonPress, onAndroidSystemBack don't take arguments
      return [] as ExtractedArgs<T>;

    case FlowEventId.DidFinishWebPaymentNavigation:
      return [event.product, event.error] as unknown as ExtractedArgs<T>;

    case FlowEventId.DidReceiveAnalyticEvent:
      return [event.name, event.params] as ExtractedArgs<T>;

    case FlowEventId.DidAskPermission:
      return [event.permission, event.customArgs] as ExtractedArgs<T>;

    case FlowEventId.ObserverDidInitiatePurchase:
    case FlowEventId.ObserverDidInitiateRestore:
      // Args (product + SDK-provided start/finish callbacks) are injected by
      // the view emitter's dedicated observer branch, not here.
      return [] as ExtractedArgs<T>;

    case FlowEventId.DidAppear:
      return [event.view] as ExtractedArgs<T>;

    case FlowEventId.DidRequestAppReview:
    case FlowEventId.DidDisappear:
    case FlowEventId.DidStartRestore:
      return [] as ExtractedArgs<T>;
  }
}
