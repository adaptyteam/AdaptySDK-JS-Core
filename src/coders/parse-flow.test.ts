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

describe('parseFlowEvent — did_ask_permission', () => {
  it('parses event_id, permission and custom_args (snake_case → camelCase)', () => {
    const input = JSON.stringify({
      id: 'flow_view_did_ask_permission',
      view: { id: 'view-1', placement_id: 'plc', variation_id: 'var' },
      event_id: 'evt-1',
      permission: 'notifications',
      custom_args: { source: 'onboarding' },
    });

    const event = parseFlowEvent(factory, input);

    expect(event).toEqual({
      id: 'flow_view_did_ask_permission',
      view: { id: 'view-1', placementId: 'plc', variationId: 'var' },
      eventId: 'evt-1',
      permission: 'notifications',
      customArgs: { source: 'onboarding' },
    });
  });

  it('defaults missing event_id/permission/custom_args to safe values', () => {
    const input = JSON.stringify({
      id: 'flow_view_did_ask_permission',
      view: { id: 'view-1' },
    });

    const event = parseFlowEvent(factory, input);

    expect(event).toMatchObject({
      eventId: '',
      permission: '',
      customArgs: {},
    });
  });
});

describe('parseFlowEvent — observer mode', () => {
  const rawProduct = {
    is_family_shareable: false,
    localized_description: 'Get premium features with this plan',
    localized_title: 'Yearly Premium Plan',
    paywall_ab_test_name: 'abTest1',
    paywall_name: 'Premium Subscription',
    paywall_variation_id: 'variation1',
    region_code: 'US',
    payload_data: 'examplePayloadData',
    vendor_product_id: 'yearly.premium.6999',
    adapty_product_id: 'adapty_product_id',
    access_level_id: 'access_level_id',
    product_type: 'product_type',
    paywall_product_index: 0,
    web_purchase_url: 'https://example.com/purchase',
    price: {
      amount: 69.99,
      currency_code: 'USD',
      currency_symbol: '$',
      localized_string: '$69.99',
    },
  };

  it('parses flow_view_observer_did_initiate_purchase with event_id and product', () => {
    const input = JSON.stringify({
      id: 'flow_view_observer_did_initiate_purchase',
      view: rawView,
      event_id: 'evt-1',
      product: rawProduct,
    });

    const event = parseFlowEvent(factory, input);

    expect(event).toMatchObject({
      id: 'flow_view_observer_did_initiate_purchase',
      view: decodedView,
      eventId: 'evt-1',
    });
    expect((event as any).product.vendorProductId).toBe('yearly.premium.6999');
  });

  it('parses flow_view_observer_did_initiate_restore with event_id', () => {
    const input = JSON.stringify({
      id: 'flow_view_observer_did_initiate_restore',
      view: rawView,
      event_id: 'evt-2',
    });

    expect(parseFlowEvent(factory, input)).toEqual({
      id: 'flow_view_observer_did_initiate_restore',
      view: decodedView,
      eventId: 'evt-2',
    });
  });

  it('defaults missing event_id to empty string', () => {
    const input = JSON.stringify({
      id: 'flow_view_observer_did_initiate_restore',
      view: { id: 'view-1' },
    });

    expect(parseFlowEvent(factory, input)).toMatchObject({ eventId: '' });
  });
});
