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
} as const;

export type FlowEventIdType = (typeof FlowEventId)[keyof typeof FlowEventId];

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
  | FlowDidFinishWebPaymentNavigationEvent;
