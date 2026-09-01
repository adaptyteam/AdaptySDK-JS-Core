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
  {
    placement,
    flow_id: 'flow789',
    flow_name: 'Flow3',
    variation_id: 'var003',
    response_created_at: 1633458390000,
    // flow_version_id without ui_schema -> no view configuration
    flow_version_id: 'fv3',
    variations: [],
  },
  {
    placement,
    flow_id: 'flow101',
    flow_name: 'Flow4',
    variation_id: 'var004',
    response_created_at: 1634458390000,
    // ui_schema without flow_version_id -> no view configuration
    ui_schema: { layouts: [], grids: [] },
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
    hasViewConfiguration:
      mock.flow_version_id !== undefined && mock.ui_schema !== undefined,
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

  const viewConfigurationCases: {
    label: string;
    mock: Def['AdaptyFlow'];
    expected: boolean;
  }[] = [
    { label: 'flow_version_id + ui_schema', mock: mocks[0]!, expected: true },
    { label: 'neither field', mock: mocks[1]!, expected: false },
    { label: 'only flow_version_id', mock: mocks[2]!, expected: false },
    { label: 'only ui_schema', mock: mocks[3]!, expected: false },
  ];

  it.each(viewConfigurationCases)(
    'should derive hasViewConfiguration=$expected for $label',
    ({ mock, expected }) => {
      expect(coder.decode(mock).hasViewConfiguration).toBe(expected);
    },
  );

  it('should not encode the derived hasViewConfiguration field', () => {
    const decoded = coder.decode(mocks[0]!);

    expect(coder.encode(decoded)).not.toHaveProperty('hasViewConfiguration');
  });
});
