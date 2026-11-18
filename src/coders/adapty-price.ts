import type { AdaptyPrice } from '@/types';
import type { Def } from '@/types/schema';
import type { Properties } from './types';
import { SimpleCoder } from './coder';

type Model = AdaptyPrice;
type Serializable = Def['AdaptyPrice'];

export class AdaptyPriceCoder extends SimpleCoder<Model, Serializable> {
  protected properties: Properties<Model, Serializable> = {
    amount: {
      key: 'amount',
      required: true,
      type: 'number',
    },
    currencyCode: {
      key: 'currency_code',
      required: true,
      type: 'string',
    },
    currencySymbol: {
      key: 'currency_symbol',
      required: false,
      type: 'string',
    },
    localizedString: {
      key: 'localized_string',
      required: true,
      type: 'string',
    },
  };
}
