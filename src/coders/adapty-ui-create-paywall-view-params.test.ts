import type { IPlatformAdapter, PlatformOS } from '@/adapters/interfaces';
import { AdaptyUICreatePaywallViewParamsCoder } from './adapty-ui-create-paywall-view-params';
import type { CreatePaywallViewParamsInput } from '@/ui-builder/types';
import type { AdaptyProductIdentifier } from '@/types';

describe('AdaptyUICreatePaywallViewParamsCoder', () => {
  const createCoder = (OS: PlatformOS = 'ios') =>
    new AdaptyUICreatePaywallViewParamsCoder({ OS } as IPlatformAdapter);
  let coder: AdaptyUICreatePaywallViewParamsCoder;

  beforeEach(() => {
    coder = createCoder();
  });

  it('should encode basic params', () => {
    const input: CreatePaywallViewParamsInput = {
      prefetchProducts: true,
      loadTimeoutMs: 10000,
    };

    const result = coder.encode(input);

    expect(result).toEqual({
      preload_products: true,
      load_timeout: 10,
    });
  });

  it('should encode custom tags', () => {
    const input: CreatePaywallViewParamsInput = {
      customTags: {
        USERNAME: 'John',
        CITY: 'New York',
      },
    };

    const result = coder.encode(input);

    expect(result).toEqual({
      custom_tags: {
        USERNAME: 'John',
        CITY: 'New York',
      },
    });
  });

  it('should encode custom timers', () => {
    const date = new Date('2024-01-01T12:00:00.000Z');
    const input: CreatePaywallViewParamsInput = {
      customTimers: {
        TIMER1: date,
      },
    };

    const result = coder.encode(input);

    expect(result).toEqual({
      custom_timers: {
        TIMER1: '2024-01-01T12:00:00.000Z',
      },
    });
  });

  it('should encode color assets', () => {
    const input: CreatePaywallViewParamsInput = {
      customAssets: {
        primaryColor: {
          type: 'color',
          argb: 0xffff0000, // Red
        },
        secondaryColor: {
          type: 'color',
          rgba: 0x00ff00ff, // Green
        },
        tertiaryColor: {
          type: 'color',
          rgb: 0x0000ff, // Blue
        },
      },
    };

    const result = coder.encode(input);

    expect(result.custom_assets).toEqual([
      {
        id: 'primaryColor',
        type: 'color',
        value: '#ff0000ff',
      },
      {
        id: 'secondaryColor',
        type: 'color',
        value: '#00ff00ff',
      },
      {
        id: 'tertiaryColor',
        type: 'color',
        value: '#0000ffff',
      },
    ]);
  });

  it('should encode image assets', () => {
    const input: CreatePaywallViewParamsInput = {
      customAssets: {
        base64Image: {
          type: 'image',
          base64:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        },
        assetImage: {
          type: 'image',
          relativeAssetPath: 'images/test.png',
        },
      },
    };

    const result = coder.encode(input);

    expect(result.custom_assets).toEqual([
      {
        id: 'base64Image',
        type: 'image',
        value:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      },
      {
        id: 'assetImage',
        type: 'image',
        asset_id: 'images/test.png',
      },
    ]);
  });

  it('should encode gradient assets', () => {
    const input: CreatePaywallViewParamsInput = {
      customAssets: {
        gradient1: {
          type: 'linear-gradient',
          values: [
            { p: 0, argb: 0xffff0000 },
            { p: 1, argb: 0xff0000ff },
          ],
          points: { x0: 0, y0: 0, x1: 1, y1: 1 },
        },
      },
    };

    const result = coder.encode(input);

    expect(result.custom_assets).toEqual([
      {
        id: 'gradient1',
        type: 'linear-gradient',
        values: [
          { color: '#ff0000ff', p: 0 },
          { color: '#0000ffff', p: 1 },
        ],
        points: { x0: 0, y0: 0, x1: 1, y1: 1 },
      },
    ]);
  });

  it('should encode product purchase parameters', () => {
    const productId: AdaptyProductIdentifier = {
      vendorProductId: 'com.example.product',
      adaptyProductId: 'adapty_product_id',
    };

    const input: CreatePaywallViewParamsInput = {
      productPurchaseParams: [
        {
          productId,
          params: {
            android: {
              isOfferPersonalized: true,
            },
          },
        },
      ],
    };

    const result = coder.encode(input);

    // AdaptyPurchaseParamsCoder only processes Android params on Android platform
    // On other platforms it returns empty object
    expect(result.product_purchase_parameters).toEqual({
      adapty_product_id: {},
    });
  });

  it('should encode product purchase parameters on Android', () => {
    coder = createCoder('android');
    const productId: AdaptyProductIdentifier = {
      vendorProductId: 'com.example.product',
      adaptyProductId: 'adapty_product_id',
    };

    const input: CreatePaywallViewParamsInput = {
      productPurchaseParams: [
        {
          productId,
          params: {
            android: {
              isOfferPersonalized: true,
            },
          },
        },
      ],
    };

    const result = coder.encode(input);

    expect(result.product_purchase_parameters).toEqual({
      adapty_product_id: {
        is_offer_personalized: true,
      },
    });
  });

  it('should encode asset_id with android suffixes on Android', () => {
    coder = createCoder('android');
    const input: CreatePaywallViewParamsInput = {
      customAssets: {
        imgRel: { type: 'image', relativeAssetPath: 'images/test.png' },
        videoRel: { type: 'video', relativeAssetPath: 'videos/intro.mp4' },
        imgFL: {
          type: 'image',
          fileLocation: {
            ios: { fileName: 'ios_name.png' },
            android: { relativeAssetPath: 'images/rel.png' },
          },
        },
        videoFL: {
          type: 'video',
          fileLocation: {
            ios: { fileName: 'ios_video.mp4' },
            android: { rawResName: 'intro' },
          },
        },
      },
    };

    const result = coder.encode(input);
    expect(result.custom_assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'imgRel',
          asset_id: 'images/test.pnga',
        }),
        expect.objectContaining({
          id: 'videoRel',
          asset_id: 'videos/intro.mp4a',
        }),
        expect.objectContaining({ id: 'imgFL', asset_id: 'images/rel.pnga' }),
        expect.objectContaining({ id: 'videoFL', asset_id: 'intror' }),
      ]),
    );
  });

  it('should handle empty input', () => {
    const input: CreatePaywallViewParamsInput = {};

    const result = coder.encode(input);

    expect(result).toEqual({});
  });
});
