import { z } from 'zod';
import { type EvidenceEventCategory } from './evidence.js';
export declare const LexiconPrivacyPolicyMetadataSchema: z.ZodObject<{
    publicByDefault: z.ZodBoolean;
    redactionRequired: z.ZodBoolean;
    allowedRedactionLevels: z.ZodArray<z.ZodEnum<["none-needed", "redacted", "aggregated"]>, "many">;
    forbiddenPublishableContent: z.ZodArray<z.ZodEnum<["raw-private-chat", "hidden-strategy", "full-per-tick-state", "unredacted-private-commitment"]>, "many">;
}, "strict", z.ZodTypeAny, {
    publicByDefault: boolean;
    redactionRequired: boolean;
    allowedRedactionLevels: ("none-needed" | "redacted" | "aggregated")[];
    forbiddenPublishableContent: ("raw-private-chat" | "hidden-strategy" | "full-per-tick-state" | "unredacted-private-commitment")[];
}, {
    publicByDefault: boolean;
    redactionRequired: boolean;
    allowedRedactionLevels: ("none-needed" | "redacted" | "aggregated")[];
    forbiddenPublishableContent: ("raw-private-chat" | "hidden-strategy" | "full-per-tick-state" | "unredacted-private-commitment")[];
}>;
export type LexiconPrivacyPolicyMetadata = z.infer<typeof LexiconPrivacyPolicyMetadataSchema>;
export declare const TrustLexiconEntryV1Schema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"trust-lexicon-entry/v1">;
    eventType: z.ZodString;
    version: z.ZodString;
    category: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
    title: z.ZodString;
    description: z.ZodString;
    privacy: z.ZodObject<{
        publicByDefault: z.ZodBoolean;
        redactionRequired: z.ZodBoolean;
        allowedRedactionLevels: z.ZodArray<z.ZodEnum<["none-needed", "redacted", "aggregated"]>, "many">;
        forbiddenPublishableContent: z.ZodArray<z.ZodEnum<["raw-private-chat", "hidden-strategy", "full-per-tick-state", "unredacted-private-commitment"]>, "many">;
    }, "strict", z.ZodTypeAny, {
        publicByDefault: boolean;
        redactionRequired: boolean;
        allowedRedactionLevels: ("none-needed" | "redacted" | "aggregated")[];
        forbiddenPublishableContent: ("raw-private-chat" | "hidden-strategy" | "full-per-tick-state" | "unredacted-private-commitment")[];
    }, {
        publicByDefault: boolean;
        redactionRequired: boolean;
        allowedRedactionLevels: ("none-needed" | "redacted" | "aggregated")[];
        forbiddenPublishableContent: ("raw-private-chat" | "hidden-strategy" | "full-per-tick-state" | "unredacted-private-commitment")[];
    }>;
    payloadGuidance: z.ZodOptional<z.ZodString>;
    deprecated: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    version: string;
    description: string;
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    privacy: {
        publicByDefault: boolean;
        redactionRequired: boolean;
        allowedRedactionLevels: ("none-needed" | "redacted" | "aggregated")[];
        forbiddenPublishableContent: ("raw-private-chat" | "hidden-strategy" | "full-per-tick-state" | "unredacted-private-commitment")[];
    };
    schemaVersion: "trust-lexicon-entry/v1";
    title: string;
    deprecated: boolean;
    payloadGuidance?: string | undefined;
}, {
    version: string;
    description: string;
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    privacy: {
        publicByDefault: boolean;
        redactionRequired: boolean;
        allowedRedactionLevels: ("none-needed" | "redacted" | "aggregated")[];
        forbiddenPublishableContent: ("raw-private-chat" | "hidden-strategy" | "full-per-tick-state" | "unredacted-private-commitment")[];
    };
    schemaVersion: "trust-lexicon-entry/v1";
    title: string;
    payloadGuidance?: string | undefined;
    deprecated?: boolean | undefined;
}>;
export type TrustLexiconEntryV1 = z.infer<typeof TrustLexiconEntryV1Schema>;
export declare class TrustLexiconRegistry {
    private readonly entries;
    constructor(entries?: readonly TrustLexiconEntryV1[]);
    register(entry: TrustLexiconEntryV1): TrustLexiconEntryV1;
    get(eventType: string, version?: string): TrustLexiconEntryV1 | undefined;
    require(eventType: string, version?: string): TrustLexiconEntryV1;
    has(eventType: string, version?: string): boolean;
    list(): readonly TrustLexiconEntryV1[];
    listByCategory(category: EvidenceEventCategory): readonly TrustLexiconEntryV1[];
    listByEventType(eventType: string): readonly TrustLexiconEntryV1[];
}
export declare const lexiconKey: (eventType: string, version: string) => string;
export declare const createTrustLexiconRegistry: (entries?: readonly TrustLexiconEntryV1[]) => TrustLexiconRegistry;
//# sourceMappingURL=lexicon.d.ts.map