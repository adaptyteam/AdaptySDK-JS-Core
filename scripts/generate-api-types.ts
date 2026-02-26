/**
 * Generates `src/types/api.d.ts` from `cross_platform.yaml`.
 *
 * Usage: yarn run yaml-to-ts
 * require Node.js >= 24 (native TypeScript support)
 *
 * The output is a single declaration file with:
 * 1. OneOf helper types (Without, XOR, OneOf)
 * 2. Empty exports: paths, webhooks
 * 3. components interface with requests, events, defs, assets
 * 4. Empty exports: $defs, external, operations
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { format, resolveConfig } from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ── Types ──────────────────────────────────────────────────────────

interface YamlSchema {
  $requests: Record<string, SchemaNode>;
  $events: Record<string, SchemaNode>;
  $defs: Record<string, SchemaNode>;
  $assets: Record<string, SchemaNode>;
  [key: string]: unknown;
}

interface SchemaNode {
  type?: string;
  const?: unknown;
  enum?: unknown[];
  $ref?: string;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  additionalProperties?: SchemaNode | boolean;
  oneOf?: SchemaNode[];
  items?: SchemaNode;
  nullable?: boolean;
  default?: unknown;
  description?: string;
  format?: string;
  pattern?: string;
  example?: unknown;
  contentEncoding?: string;
  propertyNames?: SchemaNode;
  [key: string]: unknown;
}

// ── Configuration ──────────────────────────────────────────────────

// Types from $defs that should NOT be emitted as standalone defs.
// References to these are inlined as their base type.
const EXCLUDED_DEFS = new Set(['UUID']);

let schema: YamlSchema;

// ── Platform-specific Required Fields ──────────────────────────────

/**
 * Pre-processes the raw YAML text to remove platform-specific items
 * from `required` arrays. Lines like `- field_name # iOS Only` within
 * a required block are removed, making those fields optional.
 */
function removePlatformSpecificRequired(rawYaml: string): string {
  return rawYaml.replace(
    /^(\s+)-\s+\S+\s+#\s*(?:iOS|Android)\s+Only\s*$/gm,
    '',
  );
}

// ── YAML Loading ───────────────────────────────────────────────────

function loadYaml(path: string): YamlSchema {
  const raw = readFileSync(path, 'utf-8');
  const processed = removePlatformSpecificRequired(raw);
  return yaml.load(processed) as YamlSchema;
}

// ── Ref Resolution ─────────────────────────────────────────────────

function resolveRef(ref: string): string {
  const match = ref.match(/^#\/\$(\w+)\/(.+)$/);
  if (!match) throw new Error(`Unsupported $ref: ${ref}`);

  const [, section, typeName] = match;

  // Inline excluded defs as their resolved type
  if (section === 'defs' && EXCLUDED_DEFS.has(typeName)) {
    const node = schema.$defs[typeName];
    if (node) return resolveType(node, 0);
    return 'unknown';
  }

  const tsSection = section === 'defs' ? 'defs' : 'assets';
  return `components['${tsSection}']['${typeName}']`;
}

// ── Indentation Helper ─────────────────────────────────────────────

function indent(level: number): string {
  return '  '.repeat(level);
}

// ── Type Resolution ────────────────────────────────────────────────

/**
 * Resolves a YAML schema node to a TypeScript type string.
 * @param node - The schema node
 * @param depth - Current indentation depth (in units of 2 spaces)
 * @returns TypeScript type string
 */
function resolveType(node: SchemaNode, depth: number): string {
  // $ref takes priority (ignore extra fields like nullable)
  if (node.$ref) {
    return resolveRef(node.$ref);
  }

  // const value
  if (node.const !== undefined) {
    return resolveConst(node.const);
  }

  // enum values
  if (node.enum) {
    return resolveEnum(node.enum);
  }

  // Pure oneOf (no type: object with properties)
  if (node.oneOf && !node.properties && node.type !== 'object') {
    // Special case: oneOf of primitives/enums → simple union
    if (isPrimitiveOneOf(node.oneOf)) {
      return renderPrimitiveUnion(node.oneOf);
    }
    return renderOneOf(node.oneOf, depth);
  }

  // type: object
  if (node.type === 'object') {
    return resolveObject(node, depth);
  }

  // type: array
  if (node.type === 'array') {
    return resolveArray(node, depth);
  }

  // Primitive types
  return resolvePrimitive(node.type);
}

function resolveConst(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'boolean' || typeof value === 'number')
    return String(value);
  if (Array.isArray(value)) {
    return value
      .map(v => (typeof v === 'string' ? `'${v}'` : String(v)))
      .join(' | ');
  }
  return String(value);
}

function resolveEnum(values: unknown[]): string {
  return values
    .map(v => (typeof v === 'string' ? `'${v}'` : String(v)))
    .join(' | ');
}

function resolvePrimitive(type: string | undefined): string {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'bool':
      return 'boolean';
    default:
      return 'unknown';
  }
}

/**
 * Checks if a oneOf array contains only primitive/enum types (no objects).
 * Used to determine if we should render a simple union vs OneOf<>.
 */
function isPrimitiveOneOf(variants: SchemaNode[]): boolean {
  return variants.every(v => {
    if (v.type === 'string' && !v.properties && !v.oneOf) return true;
    if (v.type === 'number' && !v.properties && !v.oneOf) return true;
    if (v.type === 'integer' && !v.properties && !v.oneOf) return true;
    if (v.type === 'boolean' && !v.properties && !v.oneOf) return true;
    if (v.enum) return true;
    return false;
  });
}

/**
 * Renders a union of primitive types and enums.
 * E.g., oneOf: [{type: string}, {enum: [a, b, c]}] → 'a' | 'b' | 'c' | string
 */
function renderPrimitiveUnion(variants: SchemaNode[]): string {
  const parts: string[] = [];
  // Put enum values first, then primitive types
  for (const v of variants) {
    if (v.enum) {
      parts.push(
        ...v.enum.map(e => (typeof e === 'string' ? `'${e}'` : String(e))),
      );
    }
  }
  for (const v of variants) {
    if (!v.enum) {
      parts.push(resolvePrimitive(v.type));
    }
  }
  return parts.join(' | ');
}

// ── Object Resolution ──────────────────────────────────────────────

function resolveObject(node: SchemaNode, depth: number): string {
  const hasProps = node.properties && Object.keys(node.properties).length > 0;
  const hasOneOf = node.oneOf && node.oneOf.length > 0;
  const hasAdditionalProps =
    node.additionalProperties !== undefined &&
    node.additionalProperties !== false;

  // Only additionalProperties, no explicit properties
  if (!hasProps && hasAdditionalProps) {
    return resolveAdditionalPropsOnly(node, depth);
  }

  // Properties + oneOf = intersection
  if (hasProps && hasOneOf) {
    const propsStr = renderObjectBody(
      node.properties!,
      node.required || [],
      depth,
    );
    const oneOfStr = renderOneOf(node.oneOf!, depth);
    return `${propsStr} & ${oneOfStr}`;
  }

  // Only oneOf, with a parent required array → discriminated union
  if (!hasProps && hasOneOf && node.required) {
    return renderDiscriminatedUnion(node.oneOf!, node.required, depth);
  }

  // Only oneOf, no required
  if (!hasProps && hasOneOf) {
    return renderOneOf(node.oneOf!, depth);
  }

  // Standard object with properties
  if (hasProps) {
    return renderObjectBody(node.properties!, node.required || [], depth);
  }

  return 'Record<string, unknown>';
}

function resolveAdditionalPropsOnly(node: SchemaNode, depth: number): string {
  const ap = node.additionalProperties as SchemaNode;

  // additionalProperties with oneOf (like CustomAttributes)
  if (ap.oneOf) {
    const types = ap.oneOf.map((v: SchemaNode) => resolveType(v, depth));
    return `{\n${indent(depth + 1)}[key: string]: ${types.join(' | ')};\n${indent(depth)}}`;
  }

  const valueType = resolveType(ap, depth);
  return `{\n${indent(depth + 1)}[key: string]: ${valueType};\n${indent(depth)}}`;
}

/**
 * Renders an object body: { prop: type; prop?: type; }
 */
function renderObjectBody(
  properties: Record<string, SchemaNode>,
  required: string[],
  depth: number,
): string {
  const requiredSet = new Set(required);
  const lines: string[] = [];
  const propIndent = indent(depth + 1);

  for (const [propName, propNode] of Object.entries(properties)) {
    const isRequired = requiredSet.has(propName);
    const opt = isRequired ? '' : '?';
    const propType = resolveType(propNode, depth + 1);
    lines.push(`${propIndent}${propName}${opt}: ${propType};`);
  }

  return `{\n${lines.join('\n')}\n${indent(depth)}}`;
}

// ── OneOf Resolution ───────────────────────────────────────────────

/**
 * Determines if a OneOf variant can be rendered as a single line.
 */
function canRenderVariantInline(variant: SchemaNode): boolean {
  if (variant.$ref) return true;
  if (!variant.properties) return true;

  const props = Object.entries(variant.properties);
  if (props.length > 2) return false;

  for (const [, prop] of props) {
    if (prop.properties || prop.oneOf || prop.additionalProperties)
      return false;
    if (prop.type === 'object') return false;
    if (prop.type === 'array' && prop.items?.oneOf) return false;
  }

  return true;
}

/**
 * Renders a single variant as an inline object string.
 */
function renderVariantInline(variant: SchemaNode): string {
  if (variant.$ref) return resolveRef(variant.$ref);
  if (!variant.properties) return resolveType(variant, 0);

  const parts: string[] = [];
  const requiredSet = new Set(variant.required || []);

  for (const [propName, propNode] of Object.entries(variant.properties)) {
    const isRequired = requiredSet.has(propName);
    const opt = isRequired ? '' : '?';
    const propType = resolveType(propNode, 0);
    parts.push(`${propName}${opt}: ${propType}`);
  }

  return `{ ${parts.join('; ')} }`;
}

/**
 * Renders OneOf<[variant1, variant2, ...]>
 */
function renderOneOf(variants: SchemaNode[], depth: number): string {
  if (variants.length === 1) {
    return renderVariant(variants[0], depth);
  }

  // Check if all variants can be inline
  const allInline = variants.every(canRenderVariantInline);

  if (allInline) {
    const inlineVariants = variants.map(renderVariantInline);
    const combined = `OneOf<[${inlineVariants.join(', ')}]>`;

    if (combined.length <= 80) {
      return combined;
    }

    // Multi-line with inline variants
    return renderMultiLineOneOf(inlineVariants, depth);
  }

  // Multi-line with expanded variants
  const variantStrs = variants.map(v => renderVariant(v, depth + 2));
  return renderMultiLineOneOfExpanded(variantStrs, depth);
}

function renderMultiLineOneOf(inlineVariants: string[], depth: number): string {
  const lines: string[] = [];
  lines.push(`OneOf<`);
  lines.push(`${indent(depth + 1)}[`);
  for (const v of inlineVariants) {
    lines.push(`${indent(depth + 2)}${v},`);
  }
  lines.push(`${indent(depth + 1)}]`);
  lines.push(`${indent(depth)}>`);
  return lines.join('\n');
}

function renderMultiLineOneOfExpanded(
  variantStrs: string[],
  depth: number,
): string {
  const lines: string[] = [];
  lines.push(`OneOf<`);
  lines.push(`${indent(depth + 1)}[`);
  for (const v of variantStrs) {
    lines.push(`${indent(depth + 2)}${v},`);
  }
  lines.push(`${indent(depth + 1)}]`);
  lines.push(`${indent(depth)}>`);
  return lines.join('\n');
}

/**
 * Renders a discriminated union as bare `|` union.
 * Used when an object has `required` + `oneOf` but no `properties`.
 * Each variant gets its own required set merged with the parent required.
 */
function renderDiscriminatedUnion(
  variants: SchemaNode[],
  parentRequired: string[],
  depth: number,
): string {
  const variantStrs = variants.map(v => {
    if (v.properties) {
      // Merge parent required with variant required
      const mergedRequired = [
        ...new Set([...parentRequired, ...(v.required || [])]),
      ];
      return renderObjectBody(v.properties, mergedRequired, depth);
    }
    return resolveType(v, depth);
  });

  if (variantStrs.length === 1) return variantStrs[0];

  return variantStrs.join(`\n${indent(depth)}| `);
}

/**
 * Renders a single variant (may be an object, a ref, or a primitive).
 */
function renderVariant(variant: SchemaNode, depth: number): string {
  if (variant.$ref) return resolveRef(variant.$ref);

  if (variant.properties) {
    return renderObjectBody(variant.properties, variant.required || [], depth);
  }

  return resolveType(variant, depth);
}

// ── Array Resolution ───────────────────────────────────────────────

function resolveArray(node: SchemaNode, depth: number): string {
  if (!node.items) return 'unknown[]';

  // Array with oneOf items
  if (node.items.oneOf) {
    const types = node.items.oneOf.map((v: SchemaNode) =>
      resolveType(v, depth),
    );
    return `(${types.join(' | ')})[]`;
  }

  const itemType = resolveType(node.items, depth);

  if (itemType.includes('|') || itemType.includes('&')) {
    return `(${itemType})[]`;
  }

  return `${itemType}[]`;
}

// ── Top-Level Type Resolution ──────────────────────────────────────

function resolveTopLevelType(node: SchemaNode, depth: number): string {
  // type: string + enum → string union
  if (node.type === 'string' && node.enum) {
    return resolveEnum(node.enum);
  }

  // type: string + oneOf → OneOf with object variants
  if (node.type === 'string' && node.oneOf) {
    return renderOneOf(node.oneOf, depth);
  }

  // type: object with oneOf and no properties → OneOf or discriminated union
  if (node.type === 'object' && node.oneOf && !node.properties) {
    if (node.required) {
      return renderDiscriminatedUnion(node.oneOf, node.required, depth);
    }
    return renderOneOf(node.oneOf, depth);
  }

  // type: object with properties + oneOf → intersection
  if (node.type === 'object' && node.oneOf && node.properties) {
    const propsStr = renderObjectBody(
      node.properties,
      node.required || [],
      depth,
    );
    const oneOfStr = renderOneOf(node.oneOf, depth);
    return `${propsStr} & ${oneOfStr}`;
  }

  // Simple string aliases
  if (node.type === 'string' && !node.enum && !node.oneOf) {
    return 'string';
  }

  return resolveType(node, depth);
}

// ── Section Rendering ──────────────────────────────────────────────

function renderSection(
  sectionName: string,
  entries: Record<string, SchemaNode>,
  sectionKey: string,
): string {
  const lines: string[] = [];
  lines.push(`${indent(1)}${sectionName}: {`);

  const entryNames = Object.keys(entries);
  let lastEmitted = false;

  for (let i = 0; i < entryNames.length; i++) {
    const name = entryNames[i];

    // Skip excluded defs
    if (sectionKey === '$defs' && EXCLUDED_DEFS.has(name)) {
      continue;
    }

    // Add blank line between entries
    if (lastEmitted) {
      lines.push('');
    }

    const node = entries[name];
    const typeStr = resolveTopLevelType(node, 2);

    // Quote name if needed
    const needsQuote = name.includes('.') || name.includes('-');
    const quotedName = needsQuote ? `'${name}'` : name;

    lines.push(`${indent(2)}${quotedName}: ${typeStr};`);

    lastEmitted = true;
  }

  lines.push(`${indent(1)}};`);
  return lines.join('\n');
}

// ── Main Generation ────────────────────────────────────────────────

function generate(): string {
  const yamlPath = resolve(ROOT, 'cross_platform.yaml');
  schema = loadYaml(yamlPath);

  const parts: string[] = [];

  // 1. OneOf helper types
  parts.push(`/** OneOf type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
type OneOf<T extends unknown[]> = T extends [infer Only]
  ? Only
  : T extends [infer A, infer B, ...infer Rest]
    ? OneOf<[XOR<A, B>, ...Rest]>
    : never;`);

  // 2. Empty exports
  parts.push(`
export type paths = Record<string, never>;

export type webhooks = Record<string, never>;`);

  // 3. components interface
  const requestsSection = renderSection(
    'requests',
    schema.$requests,
    '$requests',
  );
  const eventsSection = renderSection('events', schema.$events, '$events');
  const defsSection = renderSection('defs', schema.$defs, '$defs');
  const assetsSection = renderSection('assets', schema.$assets, '$assets');

  parts.push(`
export interface components {
${requestsSection}
${eventsSection}
${defsSection}
${assetsSection}
}`);

  // 4. Empty exports
  parts.push(`
export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
`);

  return parts.join('\n');
}

// ── Write Output ───────────────────────────────────────────────────

async function main(): Promise<void> {
  const output = generate();
  const outputPath = resolve(ROOT, 'src/types/api.d.ts');

  const prettierConfig = await resolveConfig(outputPath);
  const formatted = await format(output, {
    ...prettierConfig,
    filepath: outputPath,
  });

  writeFileSync(outputPath, formatted, 'utf-8');

  // eslint-disable-next-line no-console
  console.log(`Generated ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
