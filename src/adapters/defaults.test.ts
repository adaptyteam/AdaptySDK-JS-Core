import {
  DefaultPlatformAdapter,
  DefaultSdkMetadataAdapter,
  DefaultLoggerAdapter,
} from './defaults';

describe('DefaultPlatformAdapter', () => {
  it('should return "unknown" as OS', () => {
    const adapter = new DefaultPlatformAdapter();
    expect(adapter.OS).toBe('unknown');
  });
});

describe('DefaultSdkMetadataAdapter', () => {
  it('should return default values', () => {
    const adapter = new DefaultSdkMetadataAdapter();
    expect(adapter.sdkName).toBe('unknown');
    expect(adapter.sdkVersion).toBe('0.0.0');
  });

  it('should accept custom values', () => {
    const adapter = new DefaultSdkMetadataAdapter('test-sdk', '1.2.3');
    expect(adapter.sdkName).toBe('test-sdk');
    expect(adapter.sdkVersion).toBe('1.2.3');
  });
});

describe('DefaultLoggerAdapter', () => {
  it('should create a log context', () => {
    const adapter = new DefaultLoggerAdapter();
    const ctx = adapter.createContext();
    expect(ctx).toBeDefined();
    expect(ctx.stack).toBeDefined();
  });
});
