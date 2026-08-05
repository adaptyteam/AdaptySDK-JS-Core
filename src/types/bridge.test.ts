import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { MethodNames } from './bridge';

/**
 * Only the slice of cross_platform.yaml this test reads.
 */
interface CrossPlatformSchema {
  $requests: Record<string, { properties?: { method?: { const?: string } } }>;
}

function schemaMethods(): string[] {
  const schemaPath = resolve(__dirname, '..', '..', 'cross_platform.yaml');
  const schema = yaml.load(
    readFileSync(schemaPath, 'utf8'),
  ) as CrossPlatformSchema;

  const methods = Object.values(schema.$requests)
    .map(request => request.properties?.method?.const)
    .filter((method): method is string => typeof method === 'string');

  return [...new Set(methods)].sort();
}

describe('MethodNames', () => {
  // MethodNames is hand-maintained while the schema is generated from iOS, so
  // they drift silently: nothing reads MethodNames at runtime and the bridges
  // pass method strings straight through, so a stale entry only surfaces as an
  // "unknown request" error from native. This test is the only thing that
  // catches it.
  it('matches every request method in cross_platform.yaml', () => {
    expect([...MethodNames].sort()).toStrictEqual(schemaMethods());
  });

  it('has no duplicates', () => {
    expect(new Set(MethodNames).size).toBe(MethodNames.length);
  });
});
