import type {
  IPlatformAdapter,
  ISdkMetadataAdapter,
  ILoggerAdapter,
} from '@/adapters/interfaces';
import { AdaptyAccessLevelCoder } from './adapty-access-level';
import { AdaptyConfigurationCoder } from './adapty-configuration';
import { AdaptyDiscountPhaseCoder } from './adapty-discount-phase';
import { AdaptyFlowPaywallCoder } from './adapty-flow-paywall';
import { AdaptyFlowCoder } from './adapty-flow';
import { AdaptyIdentifyParamsCoder } from './adapty-identify-params';
import { AdaptyInstallationDetailsCoder } from './adapty-installation-details';
import { AdaptyInstallationStatusCoder } from './adapty-installation-status';
import { AdaptyNativeErrorCoder } from './adapty-native-error';
import { AdaptyNonSubscriptionCoder } from './adapty-non-subscription';
import { AdaptyOnboardingBuilderCoder } from './adapty-onboarding-builder';
import { AdaptyOnboardingCoder } from './adapty-onboarding';
import { AdaptyPaywallProductCoder } from './adapty-paywall-product';
import { AdaptyPlacementCoder } from './adapty-placement';
import { AdaptyPriceCoder } from './adapty-price';
import { AdaptyPromotedProductCoder } from './adapty-promoted-product';
import { AdaptyProfileParametersCoder } from './adapty-profile-parameters';
import { AdaptyProfileCoder } from './adapty-profile';
import { AdaptyPurchaseParamsCoder } from './adapty-purchase-params';
import { AdaptyPurchaseResultCoder } from './adapty-purchase-result';
import { AdaptyRemoteConfigCoder } from './adapty-remote-config';
import { AdaptySubscriptionDetailsCoder } from './adapty-subscription-details';
import { AdaptySubscriptionOfferIdCoder } from './adapty-subscription-offer-identifier';
import { AdaptySubscriptionOfferCoder } from './adapty-subscription-offer';
import { AdaptySubscriptionPeriodCoder } from './adapty-subscription-period';
import { AdaptySubscriptionCoder } from './adapty-subscription';
import { AdaptyUiDialogConfigCoder } from './adapty-ui-dialog-config';
import { AdaptyUICreateOnboardingViewParamsCoder } from './adapty-ui-create-onboarding-view-params';
import { AdaptyUICreateFlowViewParamsCoder } from './adapty-ui-create-flow-view-params';
import { AdaptyUiMediaCacheCoder } from './adapty-ui-media-cache';
import { AdaptyUiOnboardingMetaCoder } from './adapty-ui-onboarding-meta';
import { AdaptyUiOnboardingStateParamsCoder } from './adapty-ui-onboarding-state-params';
import { AdaptyUiOnboardingStateUpdatedActionCoder } from './adapty-ui-onboarding-state-updated-action';
import { ArrayCoder } from './array';
import { BridgeErrorCoder } from './bridge-error';
import { DateCoder } from './date';
import { HashmapCoder } from './hashmap';
import { JSONCoder } from './json';
import { ProductReferenceCoder } from './product-reference';
import type { Converter } from './types';

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

  createAccessLevelCoder(): AdaptyAccessLevelCoder {
    return new AdaptyAccessLevelCoder(this.deps.platform);
  }

  createConfigurationCoder(): AdaptyConfigurationCoder {
    return new AdaptyConfigurationCoder(
      this.deps.platform,
      this.deps.sdkMetadata,
    );
  }

  createDateCoder(): DateCoder {
    return new DateCoder();
  }

  createDiscountPhaseCoder(): AdaptyDiscountPhaseCoder {
    return new AdaptyDiscountPhaseCoder(this.deps.platform);
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

  createInstallationDetailsCoder(): AdaptyInstallationDetailsCoder {
    return new AdaptyInstallationDetailsCoder();
  }

  createInstallationStatusCoder(): AdaptyInstallationStatusCoder {
    return new AdaptyInstallationStatusCoder();
  }

  createJsonCoder(): JSONCoder {
    return new JSONCoder();
  }

  createNativeErrorCoder(): AdaptyNativeErrorCoder {
    return new AdaptyNativeErrorCoder(this.deps.platform);
  }

  createNonSubscriptionCoder(): AdaptyNonSubscriptionCoder {
    return new AdaptyNonSubscriptionCoder(this.deps.platform);
  }

  createOnboardingBuilderCoder(): AdaptyOnboardingBuilderCoder {
    return new AdaptyOnboardingBuilderCoder(this.deps.platform);
  }

  createOnboardingCoder(): AdaptyOnboardingCoder {
    return new AdaptyOnboardingCoder(this.deps.platform);
  }

  createFlowCoder(): AdaptyFlowCoder {
    return new AdaptyFlowCoder(this.deps.platform);
  }

  createFlowPaywallCoder(): AdaptyFlowPaywallCoder {
    return new AdaptyFlowPaywallCoder(this.deps.platform);
  }

  createPaywallProductCoder(): AdaptyPaywallProductCoder {
    return new AdaptyPaywallProductCoder(this.deps.platform);
  }

  createPlacementCoder(): AdaptyPlacementCoder {
    return new AdaptyPlacementCoder(this.deps.platform);
  }

  createPriceCoder(): AdaptyPriceCoder {
    return new AdaptyPriceCoder(this.deps.platform);
  }

  createProductReferenceCoder(): ProductReferenceCoder {
    return new ProductReferenceCoder(this.deps.platform);
  }

  createProfileCoder(): AdaptyProfileCoder {
    return new AdaptyProfileCoder(this.deps.platform);
  }

  createProfileParametersCoder(): AdaptyProfileParametersCoder {
    return new AdaptyProfileParametersCoder(this.deps.platform);
  }

  createPromotedProductCoder(): AdaptyPromotedProductCoder {
    return new AdaptyPromotedProductCoder(this.deps.platform);
  }

  createRemoteConfigCoder(): AdaptyRemoteConfigCoder {
    return new AdaptyRemoteConfigCoder(this.deps.platform);
  }

  createSubscriptionCoder(): AdaptySubscriptionCoder {
    return new AdaptySubscriptionCoder(this.deps.platform);
  }

  createSubscriptionDetailsCoder(): AdaptySubscriptionDetailsCoder {
    return new AdaptySubscriptionDetailsCoder(this.deps.platform);
  }

  createSubscriptionOfferCoder(): AdaptySubscriptionOfferCoder {
    return new AdaptySubscriptionOfferCoder(this.deps.platform);
  }

  createSubscriptionOfferIdCoder(): AdaptySubscriptionOfferIdCoder {
    return new AdaptySubscriptionOfferIdCoder(this.deps.platform);
  }

  createSubscriptionPeriodCoder(): AdaptySubscriptionPeriodCoder {
    return new AdaptySubscriptionPeriodCoder(this.deps.platform);
  }

  createUiCreateOnboardingViewParamsCoder(): AdaptyUICreateOnboardingViewParamsCoder {
    return new AdaptyUICreateOnboardingViewParamsCoder();
  }

  createUiCreateFlowViewParamsCoder(): AdaptyUICreateFlowViewParamsCoder {
    return new AdaptyUICreateFlowViewParamsCoder(this.deps.platform);
  }

  createUiDialogConfigCoder(): AdaptyUiDialogConfigCoder {
    return new AdaptyUiDialogConfigCoder(this.deps.platform);
  }

  createUiMediaCacheCoder(): AdaptyUiMediaCacheCoder {
    return new AdaptyUiMediaCacheCoder(this.deps.platform);
  }

  createUiOnboardingMetaCoder(): AdaptyUiOnboardingMetaCoder {
    return new AdaptyUiOnboardingMetaCoder(this.deps.platform);
  }

  createUiOnboardingStateParamsCoder(): AdaptyUiOnboardingStateParamsCoder {
    return new AdaptyUiOnboardingStateParamsCoder(this.deps.platform);
  }

  createUiOnboardingStateUpdatedActionCoder(): AdaptyUiOnboardingStateUpdatedActionCoder {
    return new AdaptyUiOnboardingStateUpdatedActionCoder(this.deps.platform);
  }

  createBridgeErrorCoder(): BridgeErrorCoder {
    return new BridgeErrorCoder(this.deps.platform);
  }

  createArrayCoder<Model, Serializable>(
    coderFactory: () => Converter<Model, Serializable>,
  ): ArrayCoder<Model, Serializable> {
    return new ArrayCoder(coderFactory);
  }

  createPaywallProductArrayCoder(): ArrayCoder<any, any> {
    return new ArrayCoder(() => this.createPaywallProductCoder());
  }

  createHashmapCoder<T extends Converter<any, any>>(
    coder: T | null,
  ): HashmapCoder<T> {
    return new HashmapCoder(coder);
  }
}
