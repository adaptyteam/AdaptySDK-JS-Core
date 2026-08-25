import type {
  AdaptyFlowUiSchema,
  AdaptyFlowUiSchemaGrid,
  AdaptyFlowUiSchemaLayout,
} from '@/types';
import type { Def } from '@/types/schema';
import type { Converter } from './types';

type Model = AdaptyFlowUiSchema;
type Serializable = NonNullable<Def['AdaptyFlow']['ui_schema']>;
type SerializableGrid = NonNullable<Serializable['grids'][number]>;
type SerializableLayout = NonNullable<Serializable['layouts'][number]>;

function decodeLayout(json: SerializableLayout): AdaptyFlowUiSchemaLayout {
  return { flowLayoutId: json.flow_layout_id };
}

function encodeLayout(model: AdaptyFlowUiSchemaLayout): SerializableLayout {
  return { flow_layout_id: model.flowLayoutId };
}

function decodeGrid(json: SerializableGrid): AdaptyFlowUiSchemaGrid {
  return {
    ...(json.platforms !== undefined && { platforms: json.platforms }),
    ...(json.devices !== undefined && { devices: json.devices }),
    ...(json.custom_id !== undefined && { customId: json.custom_id }),
    ...(json.h_breakpoints !== undefined && {
      hBreakpoints: json.h_breakpoints,
    }),
    ...(json.v_breakpoints !== undefined && {
      vBreakpoints: json.v_breakpoints,
    }),
    cells: json.cells,
  };
}

function encodeGrid(model: AdaptyFlowUiSchemaGrid): SerializableGrid {
  return {
    ...(model.platforms !== undefined && { platforms: model.platforms }),
    ...(model.devices !== undefined && { devices: model.devices }),
    ...(model.customId !== undefined && { custom_id: model.customId }),
    ...(model.hBreakpoints !== undefined && {
      h_breakpoints: model.hBreakpoints,
    }),
    ...(model.vBreakpoints !== undefined && {
      v_breakpoints: model.vBreakpoints,
    }),
    cells: model.cells,
  };
}

/**
 * `ui_schema` is written by hand rather than declared through `Properties`,
 * because `platforms` and `devices` are unions of an `'all'` literal and an
 * array, and `PropertyMeta` can only carry a single runtime type per property.
 *
 * The flow is passed back to the native side (e.g. `adapty_ui_create_flow_view`),
 * so this schema has to survive a decode/encode round trip unchanged.
 */
export class AdaptyFlowUiSchemaCoder implements Converter<Model, Serializable> {
  decode(json: Serializable): Model {
    return {
      layouts: json.layouts.map(decodeLayout),
      grids: json.grids.map(decodeGrid),
    };
  }

  encode(model: Model): Serializable {
    return {
      layouts: model.layouts.map(encodeLayout),
      grids: model.grids.map(encodeGrid),
    };
  }
}
