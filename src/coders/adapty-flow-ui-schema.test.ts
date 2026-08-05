import type { AdaptyFlowUiSchema } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptyFlowUiSchemaCoder } from './adapty-flow-ui-schema';

type Serializable = NonNullable<Def['AdaptyFlow']['ui_schema']>;

const mocks: Serializable[] = [
  {
    layouts: [{ flow_layout_id: 'layout1' }, { flow_layout_id: 'layout2' }],
    grids: [
      {
        platforms: 'all',
        devices: 'all',
        custom_id: 'grid1',
        h_breakpoints: [320, 768, 1024],
        v_breakpoints: [480, 800],
        cells: [0, 1, 2],
      },
    ],
  },
  {
    layouts: [{ flow_layout_id: 'layout1' }],
    grids: [
      {
        platforms: ['ios', 'android'],
        devices: ['phone', 'tab'],
        cells: [0],
      },
    ],
  },
  {
    // Only the required fields
    layouts: [],
    grids: [{ cells: [] }],
  },
];

describe('AdaptyFlowUiSchemaCoder', () => {
  let coder: AdaptyFlowUiSchemaCoder;

  beforeEach(() => {
    coder = new AdaptyFlowUiSchemaCoder();
  });

  it('should decode snake_case keys to camelCase', () => {
    const decoded = coder.decode(mocks[0]!);

    expect(decoded).toStrictEqual<AdaptyFlowUiSchema>({
      layouts: [{ flowLayoutId: 'layout1' }, { flowLayoutId: 'layout2' }],
      grids: [
        {
          platforms: 'all',
          devices: 'all',
          customId: 'grid1',
          hBreakpoints: [320, 768, 1024],
          vBreakpoints: [480, 800],
          cells: [0, 1, 2],
        },
      ],
    });
  });

  it('should keep platform and device arrays as arrays', () => {
    const decoded = coder.decode(mocks[1]!);

    expect(decoded.grids[0]?.platforms).toStrictEqual(['ios', 'android']);
    expect(decoded.grids[0]?.devices).toStrictEqual(['phone', 'tab']);
  });

  it('should not invent absent optional grid fields', () => {
    const decoded = coder.decode(mocks[2]!);

    expect(decoded.grids[0]).toStrictEqual({ cells: [] });
  });

  it.each(mocks)('should decode/encode round-trip', mock => {
    const decoded = coder.decode(mock);
    const encoded = coder.encode(decoded);

    expect(encoded).toStrictEqual(mock);
  });
});
