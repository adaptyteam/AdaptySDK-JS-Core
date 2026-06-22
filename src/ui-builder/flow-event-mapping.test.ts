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
