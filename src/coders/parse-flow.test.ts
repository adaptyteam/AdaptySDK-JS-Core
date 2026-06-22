import { CoderFactory } from '@/coders/factory';
import { parseFlowEvent } from '@/coders/parse-flow';
import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
} from '@/adapters/interfaces';

const factory = new CoderFactory({
  platform: { OS: 'ios' } as IPlatformAdapter,
  sdkMetadata: {
    sdkName: 'react-native',
    sdkVersion: '1.0.0',
  } as ISdkMetadataAdapter,
});

const rawView = {
  id: '9EC086AC-BE4F-4FB2-AABE-8AD31AF03BDF',
  placement_id: 'test_placement',
  variation_id: '61d30b4d-d92e-4494-8d78-f3b0f4356fae',
};

const decodedView = {
  id: rawView.id,
  placementId: rawView.placement_id,
  variationId: rawView.variation_id,
};

describe('parseFlowEvent — notification events', () => {
  it('parses flow_view_did_request_app_review', () => {
    const input = JSON.stringify({
      id: 'flow_view_did_request_app_review',
      view: rawView,
    });

    expect(parseFlowEvent(factory, input)).toEqual({
      id: 'flow_view_did_request_app_review',
      view: decodedView,
    });
  });

  it('parses flow_view_did_receive_analytic_event with name and params', () => {
    const input = JSON.stringify({
      id: 'flow_view_did_receive_analytic_event',
      view: rawView,
      name: 'paywall_shown',
      params: { source: 'onboarding', step: 2 },
    });

    expect(parseFlowEvent(factory, input)).toEqual({
      id: 'flow_view_did_receive_analytic_event',
      view: decodedView,
      name: 'paywall_shown',
      params: { source: 'onboarding', step: 2 },
    });
  });

  it('defaults params to an empty object when missing', () => {
    const input = JSON.stringify({
      id: 'flow_view_did_receive_analytic_event',
      view: rawView,
      name: 'paywall_shown',
    });

    expect(parseFlowEvent(factory, input)).toEqual({
      id: 'flow_view_did_receive_analytic_event',
      view: decodedView,
      name: 'paywall_shown',
      params: {},
    });
  });

  it('falls back to empty params when params is not an object', () => {
    const input = JSON.stringify({
      id: 'flow_view_did_receive_analytic_event',
      view: rawView,
      name: 'paywall_shown',
      params: 'oops',
    });

    expect(parseFlowEvent(factory, input)).toEqual({
      id: 'flow_view_did_receive_analytic_event',
      view: decodedView,
      name: 'paywall_shown',
      params: {},
    });
  });
});
