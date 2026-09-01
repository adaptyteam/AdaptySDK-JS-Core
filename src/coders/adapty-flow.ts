import type { AdaptyFlow } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { ArrayCoder } from './array';
import { Coder } from './coder';
import { AdaptyPlacementCoder } from '@/coders/adapty-placement';
import { AdaptyRemoteConfigCoder } from './adapty-remote-config';
import { AdaptyFlowPaywallCoder } from './adapty-flow-paywall';
import { AdaptyFlowUiSchemaCoder } from './adapty-flow-ui-schema';

type Model = AdaptyFlow;
// `hasViewConfiguration` is derived on decode and is not part of the wire
// schema, so it must be stripped before encoding the flow back to native.
type CodableModel = Omit<Model, 'hasViewConfiguration'>;
type Serializable = Def['AdaptyFlow'];

export class AdaptyFlowCoder extends Coder<Model, CodableModel, Serializable> {
  protected properties: Properties<CodableModel, Serializable> = {
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
    paywalls: {
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
    const codablePart = super.decode(data);

    return {
      ...codablePart,
      hasViewConfiguration:
        codablePart.flowVersionId !== undefined &&
        codablePart.uiSchema !== undefined,
    };
  }

  override encode(data: Model): Serializable {
    const { hasViewConfiguration, ...codablePart } = data;
    return super.encode(codablePart);
  }
}
