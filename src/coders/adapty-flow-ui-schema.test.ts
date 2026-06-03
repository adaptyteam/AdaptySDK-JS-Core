import type { AdaptyFlowUiSchema } from '@/types';
import type { Def } from '@/types/schema';
import { AdaptyFlowUiSchemaCoder } from './adapty-flow-ui-schema';

type Serializable = NonNullable<Def['AdaptyFlow']['ui_schema']>;

const mocks: Serializable[] = [
  {
    layouts: [{ flow_layout_id: 'layout_1' }, { flow_layout_id: 'layout_2' }],
    grids: [
      {
        platforms: 'all',
        devices: ['phone', 'tab'],
        custom_id: 'grid_a',
        h_breakpoints: [0, 320, 768],
        v_breakpoints: [0, 480],
        cells: [1, 2, 3],
      },
      {
        cells: [4, 5],
      },
    ],
  },
  {
    layouts: [{ flow_layout_id: 'only' }],
    grids: [{ platforms: ['ios'], devices: 'all', cells: [0] }],
  },
];

function toModel(mock: (typeof mocks)[number]): AdaptyFlowUiSchema {
  return {
    layouts: mock.layouts.map(l => ({ flowLayoutId: l.flow_layout_id })),
    grids: mock.grids.map(g => ({
      cells: g.cells,
      ...(g.platforms !== undefined && { platforms: g.platforms }),
      ...(g.devices !== undefined && { devices: g.devices }),
      ...(g.custom_id !== undefined && { customId: g.custom_id }),
      ...(g.h_breakpoints !== undefined && { hBreakpoints: g.h_breakpoints }),
      ...(g.v_breakpoints !== undefined && { vBreakpoints: g.v_breakpoints }),
    })),
  };
}

describe('AdaptyFlowUiSchemaCoder', () => {
  let coder: AdaptyFlowUiSchemaCoder;

  beforeEach(() => {
    coder = new AdaptyFlowUiSchemaCoder();
  });

  it.each(mocks)('should decode to expected result', mock => {
    expect(coder.decode(mock)).toStrictEqual(toModel(mock));
  });

  it.each(mocks)('should decode/encode round-trip', mock => {
    const decoded = coder.decode(mock);
    const encoded = coder.encode(decoded);
    expect(encoded).toStrictEqual(mock);
  });

  it('decodes the fully-populated grid with explicit field values', () => {
    const decoded = coder.decode(mocks[0]!);

    expect(decoded.layouts).toEqual([
      { flowLayoutId: 'layout_1' },
      { flowLayoutId: 'layout_2' },
    ]);

    const grid = decoded.grids[0]!;
    expect(grid.platforms).toBe('all');
    expect(grid.devices).toEqual(['phone', 'tab']);
    expect(grid.customId).toBe('grid_a');
    expect(grid.hBreakpoints).toEqual([0, 320, 768]);
    expect(grid.vBreakpoints).toEqual([0, 480]);
    expect(grid.cells).toEqual([1, 2, 3]);

    const sparseGrid = decoded.grids[1]!;
    expect(sparseGrid.cells).toEqual([4, 5]);
    expect(sparseGrid.platforms).toBeUndefined();
    expect(sparseGrid.devices).toBeUndefined();
    expect(sparseGrid.customId).toBeUndefined();
    expect(sparseGrid.hBreakpoints).toBeUndefined();
    expect(sparseGrid.vBreakpoints).toBeUndefined();
  });
});
