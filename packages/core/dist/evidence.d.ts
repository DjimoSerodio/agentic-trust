import { z } from 'zod';
export declare const EvidenceEventCategorySchema: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
export type EvidenceEventCategory = z.infer<typeof EvidenceEventCategorySchema>;
export declare const EvidenceEventTypeSchema: z.ZodString;
export declare const PublishSafetyPolicySchema: z.ZodObject<{
    publishable: z.ZodLiteral<true>;
    redaction: z.ZodEnum<["none-needed", "redacted", "aggregated"]>;
    containsPrivateChat: z.ZodLiteral<false>;
    containsHiddenStrategy: z.ZodLiteral<false>;
    containsFullTickState: z.ZodLiteral<false>;
    containsUnredactedPrivateCommitment: z.ZodLiteral<false>;
    notes: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    publishable: true;
    redaction: "none-needed" | "redacted" | "aggregated";
    containsPrivateChat: false;
    containsHiddenStrategy: false;
    containsFullTickState: false;
    containsUnredactedPrivateCommitment: false;
    notes?: string | undefined;
}, {
    publishable: true;
    redaction: "none-needed" | "redacted" | "aggregated";
    containsPrivateChat: false;
    containsHiddenStrategy: false;
    containsFullTickState: false;
    containsUnredactedPrivateCommitment: false;
    notes?: string | undefined;
}>;
/**
 * Author attestation that an evidence envelope is safe to publish.
 *
 * This schema deliberately rejects envelopes that self-identify as containing
 * private chats, hidden strategy, full tick state, or unredacted private
 * commitments. It is not a content scanner: downstream reducers/publishers
 * must still validate payloads against lexicon privacy metadata before pinning
 * or anchoring evidence.
 */
export type PublishSafetyPolicy = z.infer<typeof PublishSafetyPolicySchema>;
export declare const EvidenceReferenceSchema: z.ZodEffects<z.ZodObject<{
    uri: z.ZodString;
    digestAlgorithm: z.ZodOptional<z.ZodLiteral<"keccak256">>;
    digest: z.ZodOptional<z.ZodString>;
    mediaType: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    uri: string;
    digestAlgorithm?: "keccak256" | undefined;
    digest?: string | undefined;
    mediaType?: string | undefined;
    description?: string | undefined;
}, {
    uri: string;
    digestAlgorithm?: "keccak256" | undefined;
    digest?: string | undefined;
    mediaType?: string | undefined;
    description?: string | undefined;
}>, {
    uri: string;
    digestAlgorithm?: "keccak256" | undefined;
    digest?: string | undefined;
    mediaType?: string | undefined;
    description?: string | undefined;
}, {
    uri: string;
    digestAlgorithm?: "keccak256" | undefined;
    digest?: string | undefined;
    mediaType?: string | undefined;
    description?: string | undefined;
}>;
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export declare const TrustEvidenceEnvelopeV1Schema: z.ZodObject<{
    version: z.ZodLiteral<"trust-evidence/v1">;
    eventType: z.ZodString;
    category: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
    subject: z.ZodEffects<z.ZodObject<{
        version: z.ZodLiteral<"trust-identity/v1">;
        kind: z.ZodEnum<["coordination-game-alias", "erc-8004-agent", "ethereum-address", "did", "uri"]>;
        id: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        coordinationGameAlias: z.ZodOptional<z.ZodObject<{
            alias: z.ZodString;
            namespace: z.ZodDefault<z.ZodString>;
            gameId: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        }, {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        }>>;
        address: z.ZodOptional<z.ZodString>;
        erc8004: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            chainId: z.ZodNumber;
            registryAddress: z.ZodOptional<z.ZodString>;
            agentId: z.ZodOptional<z.ZodString>;
            ownerAddress: z.ZodOptional<z.ZodString>;
            discoveryUri: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }>, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }>>;
        did: z.ZodOptional<z.ZodString>;
        uri: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }>, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }>;
    issuer: z.ZodEffects<z.ZodObject<{
        version: z.ZodLiteral<"trust-identity/v1">;
        kind: z.ZodEnum<["coordination-game-alias", "erc-8004-agent", "ethereum-address", "did", "uri"]>;
        id: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        coordinationGameAlias: z.ZodOptional<z.ZodObject<{
            alias: z.ZodString;
            namespace: z.ZodDefault<z.ZodString>;
            gameId: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        }, {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        }>>;
        address: z.ZodOptional<z.ZodString>;
        erc8004: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            chainId: z.ZodNumber;
            registryAddress: z.ZodOptional<z.ZodString>;
            agentId: z.ZodOptional<z.ZodString>;
            ownerAddress: z.ZodOptional<z.ZodString>;
            discoveryUri: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }>, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }, {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        }>>;
        did: z.ZodOptional<z.ZodString>;
        uri: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }>, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }, {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    }>;
    observedAt: z.ZodString;
    createdAt: z.ZodString;
    summary: z.ZodString;
    payload: z.ZodDefault<z.ZodType<Record<string, import("./canonical-json.js").JsonValue>, z.ZodTypeDef, Record<string, import("./canonical-json.js").JsonValue>>>;
    evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
        uri: z.ZodString;
        digestAlgorithm: z.ZodOptional<z.ZodLiteral<"keccak256">>;
        digest: z.ZodOptional<z.ZodString>;
        mediaType: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        uri: string;
        digestAlgorithm?: "keccak256" | undefined;
        digest?: string | undefined;
        mediaType?: string | undefined;
        description?: string | undefined;
    }, {
        uri: string;
        digestAlgorithm?: "keccak256" | undefined;
        digest?: string | undefined;
        mediaType?: string | undefined;
        description?: string | undefined;
    }>, {
        uri: string;
        digestAlgorithm?: "keccak256" | undefined;
        digest?: string | undefined;
        mediaType?: string | undefined;
        description?: string | undefined;
    }, {
        uri: string;
        digestAlgorithm?: "keccak256" | undefined;
        digest?: string | undefined;
        mediaType?: string | undefined;
        description?: string | undefined;
    }>, "many">>;
    privacy: z.ZodObject<{
        publishable: z.ZodLiteral<true>;
        redaction: z.ZodEnum<["none-needed", "redacted", "aggregated"]>;
        containsPrivateChat: z.ZodLiteral<false>;
        containsHiddenStrategy: z.ZodLiteral<false>;
        containsFullTickState: z.ZodLiteral<false>;
        containsUnredactedPrivateCommitment: z.ZodLiteral<false>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        publishable: true;
        redaction: "none-needed" | "redacted" | "aggregated";
        containsPrivateChat: false;
        containsHiddenStrategy: false;
        containsFullTickState: false;
        containsUnredactedPrivateCommitment: false;
        notes?: string | undefined;
    }, {
        publishable: true;
        redaction: "none-needed" | "redacted" | "aggregated";
        containsPrivateChat: false;
        containsHiddenStrategy: false;
        containsFullTickState: false;
        containsUnredactedPrivateCommitment: false;
        notes?: string | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    version: "trust-evidence/v1";
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    subject: {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    };
    issuer: {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace: string;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    };
    observedAt: string;
    createdAt: string;
    summary: string;
    payload: Record<string, import("./canonical-json.js").JsonValue>;
    evidenceRefs: {
        uri: string;
        digestAlgorithm?: "keccak256" | undefined;
        digest?: string | undefined;
        mediaType?: string | undefined;
        description?: string | undefined;
    }[];
    privacy: {
        publishable: true;
        redaction: "none-needed" | "redacted" | "aggregated";
        containsPrivateChat: false;
        containsHiddenStrategy: false;
        containsFullTickState: false;
        containsUnredactedPrivateCommitment: false;
        notes?: string | undefined;
    };
}, {
    version: "trust-evidence/v1";
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    subject: {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    };
    issuer: {
        version: "trust-identity/v1";
        kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
        id: string;
        did?: string | undefined;
        uri?: string | undefined;
        displayName?: string | undefined;
        coordinationGameAlias?: {
            alias: string;
            namespace?: string | undefined;
            gameId?: string | undefined;
        } | undefined;
        address?: string | undefined;
        erc8004?: {
            chainId: number;
            registryAddress?: string | undefined;
            agentId?: string | undefined;
            ownerAddress?: string | undefined;
            discoveryUri?: string | undefined;
        } | undefined;
    };
    observedAt: string;
    createdAt: string;
    summary: string;
    privacy: {
        publishable: true;
        redaction: "none-needed" | "redacted" | "aggregated";
        containsPrivateChat: false;
        containsHiddenStrategy: false;
        containsFullTickState: false;
        containsUnredactedPrivateCommitment: false;
        notes?: string | undefined;
    };
    payload?: Record<string, import("./canonical-json.js").JsonValue> | undefined;
    evidenceRefs?: {
        uri: string;
        digestAlgorithm?: "keccak256" | undefined;
        digest?: string | undefined;
        mediaType?: string | undefined;
        description?: string | undefined;
    }[] | undefined;
}>;
export type TrustEvidenceEnvelopeV1 = z.infer<typeof TrustEvidenceEnvelopeV1Schema>;
export declare const defaultPublishSafetyPolicy: (redaction: PublishSafetyPolicy["redaction"]) => PublishSafetyPolicy;
export declare const parseTrustEvidenceEnvelopeV1: (value: unknown) => TrustEvidenceEnvelopeV1;
export declare const hashTrustEvidenceEnvelopeV1: (envelope: TrustEvidenceEnvelopeV1) => `0x${string}`;
//# sourceMappingURL=evidence.d.ts.map