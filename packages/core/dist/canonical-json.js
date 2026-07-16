import { keccak256, stringToBytes } from 'viem';
export class CanonicalJsonError extends TypeError {
    path;
    constructor(message, path) {
        super(`${message} at ${path}`);
        this.path = path;
        this.name = 'CanonicalJsonError';
    }
}
export const canonicalizeJson = (value) => serializeJsonValue(value, '$');
export const keccak256CanonicalJson = (value) => keccak256(stringToBytes(canonicalizeJson(value)));
const serializeJsonValue = (value, path) => {
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
                : serializeJsonObject(value, path);
    }
    throw new CanonicalJsonError('Unsupported JSON value', path);
};
const serializeJsonArray = (value, path) => {
    const serializedItems = value.map((item, index) => {
        if (!Object.hasOwn(value, index)) {
            throw new CanonicalJsonError('Sparse arrays are not valid JSON', `${path}[${index}]`);
        }
        return serializeJsonValue(item, `${path}[${index}]`);
    });
    return `[${serializedItems.join(',')}]`;
};
const serializeJsonObject = (value, path) => {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        throw new CanonicalJsonError('Only plain objects are valid JSON objects', path);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new CanonicalJsonError('Symbol-keyed properties are not valid JSON', path);
    }
    const entries = Object.entries(value).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
    const serializedEntries = entries.map(([key, item]) => {
        const propertyPath = `${path}.${key}`;
        return `${JSON.stringify(key)}:${serializeJsonValue(item, propertyPath)}`;
    });
    return `{${serializedEntries.join(',')}}`;
};
//# sourceMappingURL=canonical-json.js.map