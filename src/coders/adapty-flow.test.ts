import type { AdaptyFlow } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptyFlowCoder } from './adapty-flow';
import { AdaptyFlowPaywallCoder } from './adapty-flow-paywall';
import { AdaptyFlowUiSchemaCoder } from './adapty-flow-ui-schema';
import { AdaptyRemoteConfigCoder } from './adapty-remote-config';
import { ArrayCoder } from './array';

type Model = AdaptyFlow;

const placement: Def['AdaptyPlacement'] = {
  ab_test_name: 'testA',
  audience_name: 'audienceC',
  developer_id: 'dev123',
  revision: 5,
  placement_audience_version_id: 'version_123',
  is_tracking_purchases: true,
};

const mocks: Def['AdaptyFlow'][] = [
  {
    placement,
    flow_id: 'flow123',
    flow_name: 'Flow1',
    variation_id: 'var001',
    response_created_at: 1630458390000,
    remote_configs: [{ lang: 'en', data: '{"key":"value"}' }],
    flow_version_id: 'fv1',
    payload_data: 'additionalData',
    ui_schema: {
      layouts: [{ flow_layout_id: 'layout1' }, { flow_layout_id: 'layout2' }],
      grids: [
        {
          platforms: 'all',
          devices: ['phone'],
          custom_id: 'grid1',
          h_breakpoints: [320, 768],
          v_breakpoints: [480],
          cells: [0, 1],
        },
        // Only the required field: everything else must stay absent
        { cells: [1] },
      ],
    },
    variations: [
      {
        placement,
        paywall_id: 'pw1',
        paywall_name: 'Paywall1',
        variation_id: 'var001',
        products: [
          {
            vendor_product_id: 'product1',
            adapty_product_id: 'adaptyProduct1',
            access_level_id: 'premium',
            product_type: 'subscription',
          },
        ],
      },
    ],
  },
  {
    placement,
    flow_id: 'flow456',
    flow_name: 'Flow2',
    variation_id: 'var002',
    response_created_at: 1632458390000,
    variations: [],
  },
];

function toModel(mock: (typeof mocks)[number]): Model {
  const _remoteConfigs = new ArrayCoder(() => new AdaptyRemoteConfigCoder());
  const _paywalls = new ArrayCoder(() => new AdaptyFlowPaywallCoder());

  const decodedPlacement = {
    abTestName: mock.placement.ab_test_name,
    audienceName: mock.placement.audience_name,
    id: mock.placement.developer_id,
    revision: mock.placement.revision,
    audienceVersionId: mock.placement.placement_audience_version_id,
    ...(mock.placement.is_tracking_purchases !== undefined && {
      isTrackingPurchases: mock.placement.is_tracking_purchases,
    }),
  };

  return {
    placement: decodedPlacement,
    id: mock.flow_id,
    name: mock.flow_name,
    variationId: mock.variation_id,
    ...(mock.remote_configs && {
      remoteConfigs: _remoteConfigs.decode(mock.remote_configs),
    }),
    ...(mock.flow_version_id && { flowVersionId: mock.flow_version_id }),
    // Each variation now carries its own placement on the wire.
    paywalls: _paywalls.decode(mock.variations),
    ...(mock.ui_schema && {
      uiSchema: new AdaptyFlowUiSchemaCoder().decode(mock.ui_schema),
    }),
    responseCreatedAt: mock.response_created_at,
    ...(mock.payload_data && { payloadData: mock.payload_data }),
  };
}

describe('AdaptyFlowCoder', () => {
  let coder: AdaptyFlowCoder;

  beforeEach(() => {
    coder = new AdaptyFlowCoder();
  });

  it.each(mocks)('should decode to expected result', mock => {
    expect(coder.decode(mock)).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode round-trip', mock => {
    const decoded = coder.decode(mock);
    const encoded = coder.encode(decoded);
    expect(encoded).toStrictEqual(mock);
  });
});
