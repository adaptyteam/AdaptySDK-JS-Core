import type { AdaptyFlow } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { ArrayCoder } from './array';
import { SimpleCoder } from './coder';
import { AdaptyPlacementCoder } from '@/coders/adapty-placement';
import { AdaptyRemoteConfigCoder } from './adapty-remote-config';
import { AdaptyFlowPaywallCoder } from './adapty-flow-paywall';
import { AdaptyFlowUiSchemaCoder } from './adapty-flow-ui-schema';

type Model = AdaptyFlow;
type Serializable = Def['AdaptyFlow'];

export class AdaptyFlowCoder extends SimpleCoder<Model, Serializable> {
  protected properties: Properties<Model, Serializable> = {
    placement: {
      key: 'placement',
      required: true,
      type: 'object',
      converter: new AdaptyPlacementCoder(),
    },
    id: { key: 'flow_id', required: true, type: 'string' },
    name: { key: 'flow_name', required: true, type: 'string' },
    variationId: { key: 'variation_id', required: true, type: 'string' },
    remoteConfigs: {
      key: 'remote_configs',
      required: false,
      type: 'array',
      converter: new ArrayCoder(() => new AdaptyRemoteConfigCoder()),
    },
    flowVersionId: {
      key: 'flow_version_id',
      required: false,
      type: 'string',
    },
    variations: {
      key: 'variations',
      required: true,
      type: 'array',
      converter: new ArrayCoder(() => new AdaptyFlowPaywallCoder()),
    },
    uiSchema: {
      key: 'ui_schema',
      required: false,
      type: 'object',
      converter: new AdaptyFlowUiSchemaCoder(),
    },
    responseCreatedAt: {
      key: 'response_created_at',
      required: true,
      type: 'number',
    },
    payloadData: { key: 'payload_data', required: false, type: 'string' },
  };

  override decode(data: Serializable): Model {
    const model = super.decode(data);
    // A variation's placement is a property of the parent flow and is not
    // emitted per variation on the wire — inject the flow placement on decode.
    return {
      ...model,
      variations: model.variations.map(variation => ({
        ...variation,
        placement: model.placement,
      })),
    };
  }
}
