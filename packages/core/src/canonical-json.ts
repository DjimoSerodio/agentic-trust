import { keccak256, stringToBytes } from 'viem';

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export class CanonicalJsonError extends TypeError {
  constructor(
    message: string,
    readonly path: string,
  ) {
    super(`${message} at ${path}`);
    this.name = 'CanonicalJsonError';
  }
}

export const canonicalizeJson = (value: unknown): string => serializeJsonValue(value, '$');

export const keccak256CanonicalJson = (value: unknown): `0x${string}` =>
  keccak256(stringToBytes(canonicalizeJson(value)));

const serializeJsonValue = (value: unknown, path: string): string => {
  if (value === null) {
    return 'null';
  }

  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) {
        throw new CanonicalJsonError('Non-finite numbers are not valid JSON', path);
      }
      return JSON.stringify(value);
    case 'undefined':
      throw new CanonicalJsonError('Undefined is not valid JSON', path);
    case 'bigint':
      throw new CanonicalJsonError('Bigint is not valid JSON', path);
    case 'function':
      throw new CanonicalJsonError('Functions are not valid JSON', path);
    case 'symbol':
      throw new CanonicalJsonError('Symbols are not valid JSON', path);
    case 'object':
      return Array.isArray(value)
        ? serializeJsonArray(value, path)
        : serializeJsonObject(value as Record<string, unknown>, path);
  }

  throw new CanonicalJsonError('Unsupported JSON value', path);
};

const serializeJsonArray = (value: readonly unknown[], path: string): string => {
  const serializedItems = value.map((item, index) => {
    if (!Object.hasOwn(value, index)) {
      throw new CanonicalJsonError('Sparse arrays are not valid JSON', `${path}[${index}]`);
    }
    return serializeJsonValue(item, `${path}[${index}]`);
  });

  return `[${serializedItems.join(',')}]`;
};

const serializeJsonObject = (value: Record<string, unknown>, path: string): string => {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new CanonicalJsonError('Only plain objects are valid JSON objects', path);
  }

  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new CanonicalJsonError('Symbol-keyed properties are not valid JSON', path);
  }

  const entries = Object.entries(value).sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );

  const serializedEntries = entries.map(([key, item]) => {
    const propertyPath = `${path}.${key}`;
    return `${JSON.stringify(key)}:${serializeJsonValue(item, propertyPath)}`;
  });

  return `{${serializedEntries.join(',')}}`;
};
