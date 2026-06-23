import { AdaptyError } from '@/adapty-error';
import type {
  AdaptyPaywallProduct,
  AdaptyProfile,
  AdaptyPurchaseResult,
  WebPresentation,
} from '@/types';

// Flow Event IDs
export const FlowEventId = {
  DidAppear: 'flow_view_did_appear',
  DidDisappear: 'flow_view_did_disappear',
  DidPerformAction: 'flow_view_did_perform_action',
  DidSelectProduct: 'flow_view_did_select_product',
  DidStartPurchase: 'flow_view_did_start_purchase',
  DidFinishPurchase: 'flow_view_did_finish_purchase',
  DidFailPurchase: 'flow_view_did_fail_purchase',
  DidStartRestore: 'flow_view_did_start_restore',
  DidFinishRestore: 'flow_view_did_finish_restore',
  DidFailRestore: 'flow_view_did_fail_restore',
  DidReceiveError: 'flow_view_did_receive_error',
  DidFailLoadingProducts: 'flow_view_did_fail_loading_products',
  DidFinishWebPaymentNavigation: 'flow_view_did_finish_web_payment_navigation',
  DidRequestAppReview: 'flow_view_did_request_app_review',
  DidReceiveAnalyticEvent: 'flow_view_did_receive_analytic_event',
  DidRequestPermission: 'flow_view_did_request_permission',
} as const;

export type FlowEventIdType = (typeof FlowEventId)[keyof typeof FlowEventId];

/**
 * Permission identifier a flow view asks the host app to request.
 *
 * The literals below are the known cross-platform set; any string is valid —
 * unknown or platform-specific ids (e.g. Android `'phone'`, `'sms'`) and future
 * values pass through unchanged. The `(string & {})` keeps the known values as
 * autocomplete hints while still accepting arbitrary strings.
 */
export type AdaptyPermission =
  | 'push'
  | 'camera'
  | 'microphone'
  | 'location_when_use'
  | 'location_always'
  | 'location_full_accuracy'
  | 'photos'
  | 'contacts'
  | 'tracking'
  | 'calendar'
  | 'bluetooth'
  | 'motion'
  | 'reminders'
  | 'speech'
  | 'media_library'
  | 'local_network'
  | 'focus_status'
  | 'homekit'
  | 'health'
  | 'siri'
  | 'music'
  | (string & {});

// Event View
export interface FlowEventView {
  id: string;
  placementId?: string;
  variationId?: string;
}

// Base Event
interface BaseFlowEvent {
  id: FlowEventIdType;
  view: FlowEventView;
}

// Event Types
export interface FlowDidAppearEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidAppear;
}

export interface FlowDidDisappearEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidDisappear;
}

export type FlowUserAction =
  | { type: 'close' }
  | { type: 'system_back' }
  | { type: 'open_url'; value: string; openIn: WebPresentation }
  | { type: 'custom'; value: string };

export interface FlowDidPerformActionEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidPerformAction;
  action: FlowUserAction;
}

export interface FlowDidSelectProductEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidSelectProduct;
  productId: string;
}

export interface FlowDidStartPurchaseEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidStartPurchase;
  product: AdaptyPaywallProduct;
}

export interface FlowDidFinishPurchaseEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidFinishPurchase;
  purchaseResult: AdaptyPurchaseResult;
  product: AdaptyPaywallProduct;
}

export interface FlowDidFailPurchaseEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidFailPurchase;
  error: AdaptyError;
  product: AdaptyPaywallProduct;
}

export interface FlowDidStartRestoreEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidStartRestore;
}

export interface FlowDidFinishRestoreEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidFinishRestore;
  profile: AdaptyProfile;
}

export interface FlowDidFailRestoreEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidFailRestore;
  error: AdaptyError;
}

export interface FlowDidReceiveErrorEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidReceiveError;
  error: AdaptyError;
}

export interface FlowDidFailLoadingProductsEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidFailLoadingProducts;
  error: AdaptyError;
}

export interface FlowDidFinishWebPaymentNavigationEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidFinishWebPaymentNavigation;
  product?: AdaptyPaywallProduct;
  error?: AdaptyError;
}

export interface FlowDidRequestAppReviewEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidRequestAppReview;
}

export interface FlowDidReceiveAnalyticEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidReceiveAnalyticEvent;
  name: string;
  params: Record<string, unknown>;
}

export interface FlowDidRequestPermissionEvent extends BaseFlowEvent {
  id: typeof FlowEventId.DidRequestPermission;
  /** Correlation id — sent back to native in the response. SDK-internal. */
  requestId: string;
  /** Permission identifier the flow view asks the host to request. */
  permission: AdaptyPermission;
  /** Arbitrary string key/value args attached by the dashboard. */
  customArgs: Record<string, string>;
}

export type ParsedFlowEvent =
  | FlowDidAppearEvent
  | FlowDidDisappearEvent
  | FlowDidPerformActionEvent
  | FlowDidSelectProductEvent
  | FlowDidStartPurchaseEvent
  | FlowDidFinishPurchaseEvent
  | FlowDidFailPurchaseEvent
  | FlowDidStartRestoreEvent
  | FlowDidFinishRestoreEvent
  | FlowDidFailRestoreEvent
  | FlowDidReceiveErrorEvent
  | FlowDidFailLoadingProductsEvent
  | FlowDidFinishWebPaymentNavigationEvent
  | FlowDidRequestAppReviewEvent
  | FlowDidReceiveAnalyticEvent
  | FlowDidRequestPermissionEvent;
