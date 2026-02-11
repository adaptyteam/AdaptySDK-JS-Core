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
  paywall_view_did_perform_action: event => {
    if (event.id !== PaywallEventId.DidPerformAction) return null;

    const actionMap: Record<string, EventName> = {
      close: 'onCloseButtonPress',
      system_back: 'onAndroidSystemBack',
      open_url: 'onUrlPress',
      custom: 'onCustomAction',
    };

    return actionMap[event.action.type] || null;
  },
  paywall_view_did_appear: () => 'onPaywallShown',
  paywall_view_did_disappear: () => 'onPaywallClosed',
  paywall_view_did_select_product: () => 'onProductSelected',
  paywall_view_did_start_purchase: () => 'onPurchaseStarted',
  paywall_view_did_finish_purchase: () => 'onPurchaseCompleted',
  paywall_view_did_fail_purchase: () => 'onPurchaseFailed',
  paywall_view_did_start_restore: () => 'onRestoreStarted',
  paywall_view_did_finish_restore: () => 'onRestoreCompleted',
  paywall_view_did_fail_restore: () => 'onRestoreFailed',
  paywall_view_did_fail_rendering: () => 'onRenderingFailed',
  paywall_view_did_fail_loading_products: () => 'onLoadingProductsFailed',
  paywall_view_did_finish_web_payment_navigation: () =>
    'onWebPaymentNavigationFinished',
};

/**
 * Maps handler name to native event name
 * Used in addListener/addInternalListener to subscribe to correct native event
 */
export const HANDLER_TO_NATIVE_EVENT: Record<EventName, PaywallEventIdType> = {
  onCloseButtonPress: 'paywall_view_did_perform_action',
  onAndroidSystemBack: 'paywall_view_did_perform_action',
  onUrlPress: 'paywall_view_did_perform_action',
  onCustomAction: 'paywall_view_did_perform_action',
  onPaywallShown: 'paywall_view_did_appear',
  onPaywallClosed: 'paywall_view_did_disappear',
  onProductSelected: 'paywall_view_did_select_product',
  onPurchaseStarted: 'paywall_view_did_start_purchase',
  onPurchaseCompleted: 'paywall_view_did_finish_purchase',
  onPurchaseFailed: 'paywall_view_did_fail_purchase',
  onRestoreStarted: 'paywall_view_did_start_restore',
  onRestoreCompleted: 'paywall_view_did_finish_restore',
  onRestoreFailed: 'paywall_view_did_fail_restore',
  onRenderingFailed: 'paywall_view_did_fail_rendering',
  onLoadingProductsFailed: 'paywall_view_did_fail_loading_products',
  onWebPaymentNavigationFinished:
    'paywall_view_did_finish_web_payment_navigation',
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
      if (handlerName === 'onUrlPress' || handlerName === 'onCustomAction') {
        return [event.action.value ?? ''] as ExtractedArgs<T>;
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
