import type { EventHandlers } from './types';
import { PaywallEventId } from '@/types/paywall-events';
import type {
  ParsedPaywallEvent,
  PaywallEventIdType,
} from '@/types/paywall-events';

type EventName = keyof EventHandlers;

/**
 * Resolves native event to handler name based on event data
 */
export const NATIVE_EVENT_RESOLVER: Record<
  PaywallEventIdType,
  (event: ParsedPaywallEvent) => EventName | null
> = {
  [PaywallEventId.DidPerformAction]: event => {
    if (event.id !== PaywallEventId.DidPerformAction) return null;

    const actionMap: Record<string, EventName> = {
      close: 'onCloseButtonPress',
      system_back: 'onAndroidSystemBack',
      open_url: 'onUrlPress',
      custom: 'onCustomAction',
    };

    return actionMap[event.action.type] || null;
  },
  // TODO: v4 — rename onPaywallShown to onAppeared for consistency with Capacitor SDK
  [PaywallEventId.DidAppear]: () => 'onPaywallShown',
  // TODO: v4 — rename onPaywallClosed to onDisappeared for consistency with Capacitor SDK
  [PaywallEventId.DidDisappear]: () => 'onPaywallClosed',
  [PaywallEventId.DidSelectProduct]: () => 'onProductSelected',
  [PaywallEventId.DidStartPurchase]: () => 'onPurchaseStarted',
  [PaywallEventId.DidFinishPurchase]: () => 'onPurchaseCompleted',
  [PaywallEventId.DidFailPurchase]: () => 'onPurchaseFailed',
  [PaywallEventId.DidStartRestore]: () => 'onRestoreStarted',
  [PaywallEventId.DidFinishRestore]: () => 'onRestoreCompleted',
  [PaywallEventId.DidFailRestore]: () => 'onRestoreFailed',
  [PaywallEventId.DidFailRendering]: () => 'onRenderingFailed',
  [PaywallEventId.DidFailLoadingProducts]: () => 'onLoadingProductsFailed',
  [PaywallEventId.DidFinishWebPaymentNavigation]: () =>
    'onWebPaymentNavigationFinished',
};

/**
 * Maps handler name to native event name
 * Used in addListener/addInternalListener to subscribe to correct native event
 */
export const HANDLER_TO_NATIVE_EVENT: Record<EventName, PaywallEventIdType> = {
  onCloseButtonPress: PaywallEventId.DidPerformAction,
  onAndroidSystemBack: PaywallEventId.DidPerformAction,
  onUrlPress: PaywallEventId.DidPerformAction,
  onCustomAction: PaywallEventId.DidPerformAction,
  // TODO: v4 — rename onPaywallShown to onAppeared for consistency with Capacitor SDK
  onPaywallShown: PaywallEventId.DidAppear,
  // TODO: v4 — rename onPaywallClosed to onDisappeared for consistency with Capacitor SDK
  onPaywallClosed: PaywallEventId.DidDisappear,
  onProductSelected: PaywallEventId.DidSelectProduct,
  onPurchaseStarted: PaywallEventId.DidStartPurchase,
  onPurchaseCompleted: PaywallEventId.DidFinishPurchase,
  onPurchaseFailed: PaywallEventId.DidFailPurchase,
  onRestoreStarted: PaywallEventId.DidStartRestore,
  onRestoreCompleted: PaywallEventId.DidFinishRestore,
  onRestoreFailed: PaywallEventId.DidFailRestore,
  onRenderingFailed: PaywallEventId.DidFailRendering,
  onLoadingProductsFailed: PaywallEventId.DidFailLoadingProducts,
  onWebPaymentNavigationFinished: PaywallEventId.DidFinishWebPaymentNavigation,
};

type ExtractedArgs<T extends keyof EventHandlers> = Parameters<
  EventHandlers[T]
>;

export function extractPaywallCallbackArgs<T extends keyof EventHandlers>(
  handlerName: T,
  event: ParsedPaywallEvent,
): ExtractedArgs<T> {
  switch (event.id) {
    case PaywallEventId.DidSelectProduct:
      return [event.productId] as ExtractedArgs<T>;

    case PaywallEventId.DidStartPurchase:
      return [event.product] as ExtractedArgs<T>;

    case PaywallEventId.DidFinishPurchase:
      return [event.purchaseResult, event.product] as ExtractedArgs<T>;

    case PaywallEventId.DidFailPurchase:
      return [event.error, event.product] as ExtractedArgs<T>;

    case PaywallEventId.DidFinishRestore:
      return [event.profile] as ExtractedArgs<T>;

    case PaywallEventId.DidFailRestore:
    case PaywallEventId.DidFailRendering:
    case PaywallEventId.DidFailLoadingProducts:
      return [event.error] as ExtractedArgs<T>;

    case PaywallEventId.DidPerformAction:
      // For DidPerformAction, different handlers need different arguments
      if (handlerName === 'onUrlPress' && event.action.type === 'open_url') {
        return [event.action.value, event.action.openIn] as ExtractedArgs<T>;
      }
      if (handlerName === 'onCustomAction' && event.action.type === 'custom') {
        return [event.action.value] as ExtractedArgs<T>;
      }
      // onCloseButtonPress, onAndroidSystemBack don't take arguments
      return [] as ExtractedArgs<T>;

    case PaywallEventId.DidFinishWebPaymentNavigation:
      return [event.product, event.error] as unknown as ExtractedArgs<T>;

    case PaywallEventId.DidAppear:
    case PaywallEventId.DidDisappear:
    case PaywallEventId.DidStartRestore:
      return [] as ExtractedArgs<T>;
  }
}
