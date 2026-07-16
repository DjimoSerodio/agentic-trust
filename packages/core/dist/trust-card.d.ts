import { z } from 'zod';
export declare const TrustSignalStanceSchema: z.ZodEnum<["positive", "negative", "mixed", "informational", "unknown"]>;
export type TrustSignalStance = z.infer<typeof TrustSignalStanceSchema>;
export declare const TrustEvidenceRefSchema: z.ZodEffects<z.ZodObject<{
    envelopeHash: z.ZodOptional<z.ZodString>;
    envelopeId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    category: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
    observedAt: z.ZodString;
    summary: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    observedAt: string;
    summary?: string | undefined;
    envelopeHash?: string | undefined;
    envelopeId?: string | undefined;
}, {
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    observedAt: string;
    summary?: string | undefined;
    envelopeHash?: string | undefined;
    envelopeId?: string | undefined;
}>, {
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    observedAt: string;
    summary?: string | undefined;
    envelopeHash?: string | undefined;
    envelopeId?: string | undefined;
}, {
    eventType: string;
    category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
    observedAt: string;
    summary?: string | undefined;
    envelopeHash?: string | undefined;
    envelopeId?: string | undefined;
}>;
/**
 * Compact TrustCard evidence pointer.
 *
 * `envelopeHash` is the preferred integrity-bound reference for published
 * cards. `envelopeId` exists only for intra-system drafts where the envelope
 * has not been finalized or pinned yet.
 */
export type TrustEvidenceRef = z.infer<typeof TrustEvidenceRefSchema>;
export declare const TrustSignalV1Schema: z.ZodObject<{
    label: z.ZodString;
    stance: z.ZodEnum<["positive", "negative", "mixed", "informational", "unknown"]>;
    confidence: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
        envelopeHash: z.ZodOptional<z.ZodString>;
        envelopeId: z.ZodOptional<z.ZodString>;
        eventType: z.ZodString;
        category: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
        observedAt: z.ZodString;
        summary: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        eventType: string;
        category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
        observedAt: string;
        summary?: string | undefined;
        envelopeHash?: string | undefined;
        envelopeId?: string | undefined;
    }, {
        eventType: string;
        category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
        observedAt: string;
        summary?: string | undefined;
        envelopeHash?: string | undefined;
        envelopeId?: string | undefined;
    }>, {
        eventType: string;
        category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
        observedAt: string;
        summary?: string | undefined;
        envelopeHash?: string | undefined;
        envelopeId?: string | undefined;
    }, {
        eventType: string;
        category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
        observedAt: string;
        summary?: string | undefined;
        envelopeHash?: string | undefined;
        envelopeId?: string | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    evidenceRefs: {
        eventType: string;
        category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
        observedAt: string;
        summary?: string | undefined;
        envelopeHash?: string | undefined;
        envelopeId?: string | undefined;
    }[];
    label: string;
    stance: "unknown" | "positive" | "negative" | "mixed" | "informational";
    description?: string | undefined;
    confidence?: number | undefined;
}, {
    label: string;
    stance: "unknown" | "positive" | "negative" | "mixed" | "informational";
    description?: string | undefined;
    evidenceRefs?: {
        eventType: string;
        category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
        observedAt: string;
        summary?: string | undefined;
        envelopeHash?: string | undefined;
        envelopeId?: string | undefined;
    }[] | undefined;
    confidence?: number | undefined;
}>;
export type TrustSignalV1 = z.infer<typeof TrustSignalV1Schema>;
export declare const TrustCardV1Schema: z.ZodObject<{
    version: z.ZodLiteral<"trust-card/v1">;
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
    generatedAt: z.ZodString;
    headline: z.ZodString;
    summary: z.ZodObject<{
        compact: z.ZodString;
        caveats: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strict", z.ZodTypeAny, {
        compact: string;
        caveats: string[];
    }, {
        compact: string;
        caveats?: string[] | undefined;
    }>;
    signals: z.ZodDefault<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        stance: z.ZodEnum<["positive", "negative", "mixed", "informational", "unknown"]>;
        confidence: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            envelopeHash: z.ZodOptional<z.ZodString>;
            envelopeId: z.ZodOptional<z.ZodString>;
            eventType: z.ZodString;
            category: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
            observedAt: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }>, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        evidenceRefs: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[];
        label: string;
        stance: "unknown" | "positive" | "negative" | "mixed" | "informational";
        description?: string | undefined;
        confidence?: number | undefined;
    }, {
        label: string;
        stance: "unknown" | "positive" | "negative" | "mixed" | "informational";
        description?: string | undefined;
        evidenceRefs?: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[] | undefined;
        confidence?: number | undefined;
    }>, "many">>;
    evidenceSummary: z.ZodObject<{
        evidenceCount: z.ZodNumber;
        categories: z.ZodDefault<z.ZodArray<z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>, "many">>;
        eventTypes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        latestObservedAt: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        evidenceCount: number;
        categories: ("identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy")[];
        eventTypes: string[];
        latestObservedAt?: string | undefined;
    }, {
        evidenceCount: number;
        categories?: ("identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy")[] | undefined;
        eventTypes?: string[] | undefined;
        latestObservedAt?: string | undefined;
    }>;
    drillDown: z.ZodObject<{
        evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            envelopeHash: z.ZodOptional<z.ZodString>;
            envelopeId: z.ZodOptional<z.ZodString>;
            eventType: z.ZodString;
            category: z.ZodEnum<["identity", "behavior", "capability", "outcome", "attestation", "policy"]>;
            observedAt: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }>, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }, {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        evidenceRefs: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[];
    }, {
        evidenceRefs?: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[] | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    version: "trust-card/v1";
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
    summary: {
        compact: string;
        caveats: string[];
    };
    generatedAt: string;
    headline: string;
    signals: {
        evidenceRefs: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[];
        label: string;
        stance: "unknown" | "positive" | "negative" | "mixed" | "informational";
        description?: string | undefined;
        confidence?: number | undefined;
    }[];
    evidenceSummary: {
        evidenceCount: number;
        categories: ("identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy")[];
        eventTypes: string[];
        latestObservedAt?: string | undefined;
    };
    drillDown: {
        evidenceRefs: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[];
    };
}, {
    version: "trust-card/v1";
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
    summary: {
        compact: string;
        caveats?: string[] | undefined;
    };
    generatedAt: string;
    headline: string;
    evidenceSummary: {
        evidenceCount: number;
        categories?: ("identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy")[] | undefined;
        eventTypes?: string[] | undefined;
        latestObservedAt?: string | undefined;
    };
    drillDown: {
        evidenceRefs?: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[] | undefined;
    };
    signals?: {
        label: string;
        stance: "unknown" | "positive" | "negative" | "mixed" | "informational";
        description?: string | undefined;
        evidenceRefs?: {
            eventType: string;
            category: "identity" | "behavior" | "capability" | "outcome" | "attestation" | "policy";
            observedAt: string;
            summary?: string | undefined;
            envelopeHash?: string | undefined;
            envelopeId?: string | undefined;
        }[] | undefined;
        confidence?: number | undefined;
    }[] | undefined;
}>;
export type TrustCardV1 = z.infer<typeof TrustCardV1Schema>;
export declare const createEmptyTrustCardV1: (input: {
    readonly subject: TrustCardV1["subject"];
    readonly generatedAt: string;
    readonly caveats?: readonly string[];
}) => TrustCardV1;
//# sourceMappingURL=trust-card.d.ts.map