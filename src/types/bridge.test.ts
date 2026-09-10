import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { MethodNames, GLOBAL_EVENT_TO_NATIVE_EVENT } from './bridge';

/**
 * Only the slice of cross_platform.yaml this test reads.
 */
interface CrossPlatformSchema {
  $requests: Record<string, { properties?: { method?: { const?: string } } }>;
  $events: Record<string, { properties?: { id?: { const?: string } } }>;
}

/** Global events are the `Event.*` entries; the rest are flow/onboarding view events. */
const GLOBAL_EVENT_PREFIX = 'Event.';

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

function schemaGlobalEventIds(): string[] {
  const schemaPath = resolve(__dirname, '..', '..', 'cross_platform.yaml');
  const schema = yaml.load(
    readFileSync(schemaPath, 'utf8'),
  ) as CrossPlatformSchema;

  const ids = Object.entries(schema.$events)
    .filter(([key]) => key.startsWith(GLOBAL_EVENT_PREFIX))
    .map(([, event]) => event.properties?.id?.const)
    .filter((id): id is string => typeof id === 'string');

  return [...new Set(ids)].sort();
}

describe('GLOBAL_EVENT_TO_NATIVE_EVENT', () => {
  // The values are already checked against the schema by the compiler, through
  // GlobalEventMap. What the compiler cannot see is an event the schema gained and
  // this map never got: a wrapper would then have no way to subscribe to it,
  // and nothing would say so.
  it('covers every global event in cross_platform.yaml, and no others', () => {
    expect(Object.values(GLOBAL_EVENT_TO_NATIVE_EVENT).sort()).toStrictEqual(
      schemaGlobalEventIds(),
    );
  });

  it('maps each handler name to a distinct native event', () => {
    const ids = Object.values(GLOBAL_EVENT_TO_NATIVE_EVENT);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

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
