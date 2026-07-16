import { z } from 'zod';
import { keccak256CanonicalJson } from './canonical-json.js';
import { TrustAgentIdentityV1Schema } from './identity.js';
import { JsonObjectSchema } from './json-schema.js';
export const EvidenceEventCategorySchema = z.enum([
    'identity',
    'behavior',
    'capability',
    'outcome',
    'attestation',
    'policy',
]);
export const EvidenceEventTypeSchema = z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/, 'Use lowercase namespaced event types');
export const PublishSafetyPolicySchema = z
    .object({
    publishable: z.literal(true),
    redaction: z.enum(['none-needed', 'redacted', 'aggregated']),
    containsPrivateChat: z.literal(false),
    containsHiddenStrategy: z.literal(false),
    containsFullTickState: z.literal(false),
    containsUnredactedPrivateCommitment: z.literal(false),
    notes: z.string().max(280).optional(),
})
    .strict();
export const EvidenceReferenceSchema = z
    .object({
    uri: z.string().min(1).max(500),
    digestAlgorithm: z.literal('keccak256').optional(),
    digest: z
        .string()
        .regex(/^0x[a-fA-F0-9]{64}$/)
        .optional(),
    mediaType: z.string().min(1).max(120).optional(),
    description: z.string().max(240).optional(),
})
    .strict()
    .superRefine((value, context) => {
    if (value.digest !== undefined && value.digestAlgorithm === undefined) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['digestAlgorithm'],
            message: 'Evidence references with a digest must declare digestAlgorithm',
        });
    }
    if (value.digestAlgorithm !== undefined && value.digest === undefined) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['digest'],
            message: 'Evidence references with digestAlgorithm must include digest',
        });
    }
});
export const TrustEvidenceEnvelopeV1Schema = z
    .object({
    version: z.literal('trust-evidence/v1'),
    eventType: EvidenceEventTypeSchema,
    category: EvidenceEventCategorySchema,
    subject: TrustAgentIdentityV1Schema,
    issuer: TrustAgentIdentityV1Schema,
    observedAt: z.string().datetime({ offset: true }),
    createdAt: z.string().datetime({ offset: true }),
    summary: z.string().min(1).max(500),
    payload: JsonObjectSchema.default({}),
    evidenceRefs: z.array(EvidenceReferenceSchema).default([]),
    privacy: PublishSafetyPolicySchema,
})
    .strict();
export const defaultPublishSafetyPolicy = (redaction) => PublishSafetyPolicySchema.parse({
    publishable: true,
    redaction,
    containsPrivateChat: false,
    containsHiddenStrategy: false,
    containsFullTickState: false,
    containsUnredactedPrivateCommitment: false,
});
export const parseTrustEvidenceEnvelopeV1 = (value) => TrustEvidenceEnvelopeV1Schema.parse(value);
export const hashTrustEvidenceEnvelopeV1 = (envelope) => keccak256CanonicalJson(TrustEvidenceEnvelopeV1Schema.parse(envelope));
//# sourceMappingURL=evidence.js.map