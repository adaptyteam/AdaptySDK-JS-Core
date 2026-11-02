import type { IPlatformAdapter, PlatformOS } from '@/adapters/interfaces';
import { AdaptyReportTransactionParamsCoder } from '@/coders/adapty-report-transaction-params';

describe('AdaptyReportTransactionParamsCoder', () => {
  const createCoder = (OS: PlatformOS = 'ios') =>
    new AdaptyReportTransactionParamsCoder({ OS } as IPlatformAdapter);

  const fullParams = {
    transactionId: 'transaction_12345',
    variationId: 'variation_abc',
    ios: { jwsTransaction: 'jws_transaction_abc' },
  };

  it('should encode only transaction_id when nothing else is set', () => {
    const result = createCoder().encode({ transactionId: 'transaction_12345' });
    expect(result).toEqual({ transaction_id: 'transaction_12345' });
  });

  it('should omit empty variation_id', () => {
    const result = createCoder().encode({
      transactionId: 'transaction_12345',
      variationId: '',
    });
    expect(result).toEqual({ transaction_id: 'transaction_12345' });
  });

  it('should encode all fields on iOS', () => {
    const result = createCoder('ios').encode(fullParams);
    expect(result).toEqual({
      transaction_id: 'transaction_12345',
      variation_id: 'variation_abc',
      apple_jws_transaction: 'jws_transaction_abc',
    });
  });

  it.each(['android', 'unknown'] as const)(
    'should omit apple_jws_transaction on %s',
    OS => {
      const result = createCoder(OS).encode(fullParams);
      expect(result).toEqual({
        transaction_id: 'transaction_12345',
        variation_id: 'variation_abc',
      });
    },
  );

  it('should omit empty jwsTransaction on iOS', () => {
    const result = createCoder('ios').encode({
      transactionId: 'transaction_12345',
      ios: { jwsTransaction: '' },
    });
    expect(result).toEqual({ transaction_id: 'transaction_12345' });
  });
});
