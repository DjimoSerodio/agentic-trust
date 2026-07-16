import { z } from 'zod';
const isJsonValue = (value) => {
    if (value === null) {
        return true;
    }
    switch (typeof value) {
        case 'string':
        case 'boolean':
            return true;
        case 'number':
            return Number.isFinite(value);
        case 'object':
            if (Array.isArray(value)) {
                return value.every((item, index) => Object.hasOwn(value, index) && isJsonValue(item));
            }
            if (Object.getPrototypeOf(value) !== Object.prototype &&
                Object.getPrototypeOf(value) !== null) {
                return false;
            }
            if (Object.getOwnPropertySymbols(value).length > 0) {
                return false;
            }
            return Object.values(value).every(isJsonValue);
        default:
            return false;
    }
};
export const JsonValueSchema = z.custom(isJsonValue, {
    message: 'Expected a strict JSON value',
});
export const JsonObjectSchema = z.custom((value) => typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    isJsonValue(value), { message: 'Expected a strict JSON object' });
//# sourceMappingURL=json-schema.js.map