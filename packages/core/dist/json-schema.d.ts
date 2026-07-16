import { z } from 'zod';
import type { JsonValue } from './canonical-json.js';
export declare const JsonValueSchema: z.ZodType<JsonValue>;
export declare const JsonObjectSchema: z.ZodType<Record<string, JsonValue>, z.ZodTypeDef, Record<string, JsonValue>>;
export type JsonObject = z.infer<typeof JsonObjectSchema>;
//# sourceMappingURL=json-schema.d.ts.map