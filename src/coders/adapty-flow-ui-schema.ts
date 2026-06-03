import type { AdaptyFlowUiSchema } from '@/types';
import type { Def } from '@/types/schema';
import type { Converter } from './types';

type Serializable = NonNullable<Def['AdaptyFlow']['ui_schema']>;

export class AdaptyFlowUiSchemaCoder implements Converter<
  AdaptyFlowUiSchema,
  Serializable
> {
  decode(data: Serializable): AdaptyFlowUiSchema {
    return {
      layouts: data.layouts.map(layout => ({
        flowLayoutId: layout.flow_layout_id,
      })),
      grids: data.grids.map(grid => ({
        cells: grid.cells,
        ...(grid.platforms !== undefined && { platforms: grid.platforms }),
        ...(grid.devices !== undefined && { devices: grid.devices }),
        ...(grid.custom_id !== undefined && { customId: grid.custom_id }),
        ...(grid.h_breakpoints !== undefined && {
          hBreakpoints: grid.h_breakpoints,
        }),
        ...(grid.v_breakpoints !== undefined && {
          vBreakpoints: grid.v_breakpoints,
        }),
      })),
    };
  }

  encode(data: AdaptyFlowUiSchema): Serializable {
    return {
      layouts: data.layouts.map(layout => ({
        flow_layout_id: layout.flowLayoutId,
      })),
      grids: data.grids.map(grid => ({
        cells: grid.cells,
        ...(grid.platforms !== undefined && { platforms: grid.platforms }),
        ...(grid.devices !== undefined && { devices: grid.devices }),
        ...(grid.customId !== undefined && { custom_id: grid.customId }),
        ...(grid.hBreakpoints !== undefined && {
          h_breakpoints: grid.hBreakpoints,
        }),
        ...(grid.vBreakpoints !== undefined && {
          v_breakpoints: grid.vBreakpoints,
        }),
      })),
    };
  }
}
