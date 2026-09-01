import type { Event } from './schema';

/**
 * Valid list of callable bridge handlers.
 *
 * The source of truth is `cross_platform.yaml`: one entry per `$requests`
 * method const. `bridge.test.ts` asserts the two stay in sync — a method the
 * native side does not register would fail at runtime, not at compile time.
 * @internal
 */
export const MethodNames = [
  'activate',
  'adapty_ui_create_flow_view',
  'adapty_ui_dismiss_flow_view',
  'adapty_ui_present_flow_view',
  'adapty_ui_show_dialog',
  'adapty_ui_create_onboarding_view',
  'adapty_ui_dismiss_onboarding_view',
  'adapty_ui_present_onboarding_view',
  'create_web_paywall_url',
  'get_current_installation_status',
  'is_activated',
  'get_flow',
  'get_flow_for_default_audience',
  'get_paywall_products',
  'get_onboarding',
  'get_onboarding_for_default_audience',
  'get_profile',
  'get_log_level',
  'get_sdk_version',
  'identify',
  'log_show_flow',
  'logout',
  'make_promoted_purchase',
  'make_purchase',
  'open_web_paywall',
  'present_code_redemption_sheet',
  'report_transaction',
  'restore_purchases',
  'set_fallback',
  'set_integration_identifiers',
  'set_log_level',
  'update_collecting_refund_data_consent',
  'update_external_attribution_data',
  'update_profile',
  'update_refund_preference',
  'flow_view_did_answer_permission',
  'adapty_ui_open_url',
  'adapty_ui_request_app_review',
  'observer_purchase_did_start',
  'observer_purchase_did_finish',
  'observer_restore_did_start',
  'observer_restore_did_finish',
] as const;
export type MethodName = (typeof MethodNames)[number];

/**
 * Types of values that can be passed
 * to the bridge without corruption
 */
export type Serializable =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

/**
 * Interface of error that emit from native SDK
 */
export interface AdaptyNativeError {
  adaptyCode: number;
  message: string;
  detail?: string | undefined;
}

/**
 * Interface of error that was raised by native bridge
 */
export interface AdaptyBridgeError {
  errorType: string;
  name?: string;
  type?: string;
  underlyingError?: string;
  description?: string;
}

/**
 * The SDK's global events - the ones not scoped to a flow view or an
 * onboarding - as public handler name -> native wire id.
 *
 * Both halves are load-bearing. `keyof` gives {@link UserEventName}, the names
 * a consumer passes to `addEventListener`; the values are the ids the native
 * side actually emits. The ids come off `cross_platform.yaml` through the
 * generated schema rather than being written out as free strings, so a typo in
 * {@link USER_EVENT_TO_NATIVE_ID} cannot reach a bridge subscription.
 * `bridge.test.ts` covers the other direction - that no global event in the
 * schema is missing from the map.
 */
interface EventMap {
  onLatestProfileLoad: Event['Event.DidLoadLatestProfile']['id'];
  onPromotedPurchaseReceived: Event['Event.DidReceivePromotedPurchase']['id'];
  onInstallationDetailsSuccess: Event['Event.OnInstallationDetailsSuccess']['id'];
  onInstallationDetailsFail: Event['Event.OnInstallationDetailsFail']['id'];
}

export type UserEventName = keyof EventMap;

/**
 * Native wire id of a global SDK event.
 *
 * @remarks
 * Type anything that subscribes to a global event by wire id with this. A bare
 * `string` there is what lets a typo compile, because nothing downstream
 * compares it against the schema.
 */
export type UserEventId = EventMap[UserEventName];

/**
 * Handler name -> native wire id, for the global events.
 *
 * @remarks
 * Wrappers subscribe by handler name, so this is what turns the name the app
 * wrote into the string the bridge expects. It is the global-event counterpart
 * of `HANDLER_TO_NATIVE_EVENT` (flow views) and `HANDLER_TO_EVENT_CONFIG`
 * (onboardings).
 */
export const USER_EVENT_TO_NATIVE_ID: EventMap = {
  onLatestProfileLoad: 'did_load_latest_profile',
  onPromotedPurchaseReceived: 'did_receive_promoted_purchase',
  onInstallationDetailsSuccess: 'on_installation_details_success',
  onInstallationDetailsFail: 'on_installation_details_fail',
};
