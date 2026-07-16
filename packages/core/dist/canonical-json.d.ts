export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
export declare class CanonicalJsonError extends TypeError {
    readonly path: string;
    constructor(message: string, path: string);
}
export declare const canonicalizeJson: (value: unknown) => string;
export declare const keccak256CanonicalJson: (value: unknown) => `0x${string}`;
//# sourceMappingURL=canonical-json.d.ts.map