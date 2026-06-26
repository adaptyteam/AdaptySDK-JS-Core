import {
  NATIVE_EVENT_RESOLVER,
  HANDLER_TO_NATIVE_EVENT,
  extractFlowCallbackArgs,
} from '@/ui-builder/flow-event-mapping';
import { FlowEventId } from '@/types/flow-events';

const view = { id: 'view-1' };

describe('flow-event-mapping — notification events', () => {
  it('resolves the app review event to onRequestAppReview', () => {
    const resolver = NATIVE_EVENT_RESOLVER[FlowEventId.DidRequestAppReview];
    expect(resolver({ id: FlowEventId.DidRequestAppReview, view })).toBe(
      'onRequestAppReview',
    );
  });

  it('resolves the analytic event to onAnalytics', () => {
    const resolver = NATIVE_EVENT_RESOLVER[FlowEventId.DidReceiveAnalyticEvent];
    expect(
      resolver({
        id: FlowEventId.DidReceiveAnalyticEvent,
        view,
        name: 'paywall_shown',
        params: {},
      }),
    ).toBe('onAnalytics');
  });

  it('maps handler names back to native event ids', () => {
    expect(HANDLER_TO_NATIVE_EVENT.onRequestAppReview).toBe(
      FlowEventId.DidRequestAppReview,
    );
    expect(HANDLER_TO_NATIVE_EVENT.onAnalytics).toBe(
      FlowEventId.DidReceiveAnalyticEvent,
    );
  });

  it('extracts analytic args as [name, params]', () => {
    const args = extractFlowCallbackArgs('onAnalytics', {
      id: FlowEventId.DidReceiveAnalyticEvent,
      view,
      name: 'paywall_shown',
      params: { source: 'onboarding' },
    });
    expect(args).toEqual(['paywall_shown', { source: 'onboarding' }]);
  });

  it('extracts app review args as []', () => {
    const args = extractFlowCallbackArgs('onRequestAppReview', {
      id: FlowEventId.DidRequestAppReview,
      view,
    });
    expect(args).toEqual([]);
  });
});

describe('flow-event-mapping — onRequestPermission', () => {
  it('resolves the permission native event to onRequestPermission', () => {
    const event = {
      id: FlowEventId.DidAskPermission,
      view: { id: 'v' },
      eventId: 'evt-1',
      permission: 'notifications',
      customArgs: { a: 'b' },
    } as const;

    const resolver = NATIVE_EVENT_RESOLVER[FlowEventId.DidAskPermission];
    expect(resolver(event)).toBe('onRequestPermission');
  });

  it('maps the handler back to the permission native event', () => {
    expect(HANDLER_TO_NATIVE_EVENT.onRequestPermission).toBe(
      FlowEventId.DidAskPermission,
    );
  });

  it('extracts [permission, customArgs] (event id stays hidden)', () => {
    const event = {
      id: FlowEventId.DidAskPermission,
      view: { id: 'v' },
      eventId: 'evt-1',
      permission: 'notifications',
      customArgs: { source: 'onboarding' },
    } as const;

    expect(extractFlowCallbackArgs('onRequestPermission', event)).toEqual([
      'notifications',
      { source: 'onboarding' },
    ]);
  });
});

describe('flow-event-mapping — observer mode', () => {
  it('resolves observer purchase native event to onObserverPurchaseInitiated', () => {
    const resolver =
      NATIVE_EVENT_RESOLVER[FlowEventId.ObserverDidInitiatePurchase];
    expect(
      resolver({ id: FlowEventId.ObserverDidInitiatePurchase } as any),
    ).toBe('onObserverPurchaseInitiated');
  });

  it('resolves observer restore native event to onObserverRestoreInitiated', () => {
    const resolver =
      NATIVE_EVENT_RESOLVER[FlowEventId.ObserverDidInitiateRestore];
    expect(
      resolver({ id: FlowEventId.ObserverDidInitiateRestore } as any),
    ).toBe('onObserverRestoreInitiated');
  });

  it('maps observer handlers back to their native events', () => {
    expect(HANDLER_TO_NATIVE_EVENT.onObserverPurchaseInitiated).toBe(
      FlowEventId.ObserverDidInitiatePurchase,
    );
    expect(HANDLER_TO_NATIVE_EVENT.onObserverRestoreInitiated).toBe(
      FlowEventId.ObserverDidInitiateRestore,
    );
  });

  it('extracts [] for observer events (args are injected by the emitter)', () => {
    expect(
      extractFlowCallbackArgs('onObserverPurchaseInitiated', {
        id: FlowEventId.ObserverDidInitiatePurchase,
      } as any),
    ).toEqual([]);
    expect(
      extractFlowCallbackArgs('onObserverRestoreInitiated', {
        id: FlowEventId.ObserverDidInitiateRestore,
      } as any),
    ).toEqual([]);
  });
});
