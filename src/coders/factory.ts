import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
  ILoggerAdapter,
} from '@/adapters/interfaces';
import { AdaptyConfigurationCoder } from './adapty-configuration';
import { AdaptyIdentifyParamsCoder } from './adapty-identify-params';
import { AdaptyPurchaseParamsCoder } from './adapty-purchase-params';
import { AdaptyPurchaseResultCoder } from './adapty-purchase-result';
import { AdaptyUICreatePaywallViewParamsCoder } from './adapty-ui-create-paywall-view-params';

/**
 * Dependencies container for coders
 */
export interface CoderDependencies {
  platform: IPlatformAdapter;
  sdkMetadata: ISdkMetadataAdapter;
  logger?: ILoggerAdapter;
}

/**
 * Factory for creating coders with injected dependencies
 */
export class CoderFactory {
  constructor(private readonly deps: CoderDependencies) {}

  createConfigurationCoder(): AdaptyConfigurationCoder {
    return new AdaptyConfigurationCoder(
      this.deps.platform,
      this.deps.sdkMetadata,
    );
  }

  createPurchaseParamsCoder(): AdaptyPurchaseParamsCoder {
    return new AdaptyPurchaseParamsCoder(this.deps.platform);
  }

  createPurchaseResultCoder(): AdaptyPurchaseResultCoder {
    return new AdaptyPurchaseResultCoder(this.deps.platform);
  }

  createIdentifyParamsCoder(): AdaptyIdentifyParamsCoder {
    return new AdaptyIdentifyParamsCoder(this.deps.platform);
  }

  createUiCreatePaywallViewParamsCoder(): AdaptyUICreatePaywallViewParamsCoder {
    return new AdaptyUICreatePaywallViewParamsCoder(this.deps.platform);
  }
}
