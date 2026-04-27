import { z } from 'zod';

import { EvidenceEventCategorySchema, EvidenceEventTypeSchema } from './evidence.js';
import { TrustAgentIdentityV1Schema } from './identity.js';

export const TrustSignalStanceSchema = z.enum([
  'positive',
  'negative',
  'mixed',
  'informational',
  'unknown',
]);

export type TrustSignalStance = z.infer<typeof TrustSignalStanceSchema>;

export const TrustEvidenceRefSchema = z
  .object({
    envelopeHash: z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .optional(),
    envelopeId: z.string().min(1).max(160).optional(),
    eventType: EvidenceEventTypeSchema,
    category: EvidenceEventCategorySchema,
    observedAt: z.string().datetime({ offset: true }),
    summary: z.string().max(240).optional(),
  })
  .strict()
  .refine(
    (value) => value.envelopeHash !== undefined || value.envelopeId !== undefined,
    'Evidence references require envelopeHash or envelopeId',
  );

/**
 * Compact TrustCard evidence pointer.
 *
 * `envelopeHash` is the preferred integrity-bound reference for published
 * cards. `envelopeId` exists only for intra-system drafts where the envelope
 * has not been finalized or pinned yet.
 */

export type TrustEvidenceRef = z.infer<typeof TrustEvidenceRefSchema>;

export const TrustSignalV1Schema = z
  .object({
    label: z.string().min(1).max(80),
    stance: TrustSignalStanceSchema,
    confidence: z.number().min(0).max(1).optional(),
    description: z.string().max(280).optional(),
    evidenceRefs: z.array(TrustEvidenceRefSchema).default([]),
  })
  .strict();

export type TrustSignalV1 = z.infer<typeof TrustSignalV1Schema>;

export const TrustCardV1Schema = z
  .object({
    version: z.literal('trust-card/v1'),
    subject: TrustAgentIdentityV1Schema,
    generatedAt: z.string().datetime({ offset: true }),
    headline: z.string().min(1).max(140),
    summary: z
      .object({
        compact: z.string().min(1).max(500),
        caveats: z.array(z.string().min(1).max(180)).default([]),
      })
      .strict(),
    signals: z.array(TrustSignalV1Schema).default([]),
    evidenceSummary: z
      .object({
        evidenceCount: z.number().int().min(0),
        categories: z.array(EvidenceEventCategorySchema).default([]),
        eventTypes: z.array(EvidenceEventTypeSchema).default([]),
        latestObservedAt: z.string().datetime({ offset: true }).optional(),
      })
      .strict(),
    drillDown: z
      .object({
        evidenceRefs: z.array(TrustEvidenceRefSchema).default([]),
      })
      .strict(),
  })
  .strict();

export type TrustCardV1 = z.infer<typeof TrustCardV1Schema>;

export const createEmptyTrustCardV1 = (input: {
  readonly subject: TrustCardV1['subject'];
  readonly generatedAt: string;
  readonly caveats?: readonly string[];
}): TrustCardV1 =>
  TrustCardV1Schema.parse({
    version: 'trust-card/v1',
    subject: input.subject,
    generatedAt: input.generatedAt,
    headline: 'No published trust evidence yet',
    summary: {
      compact: 'No publishable evidence has been reduced for this agent yet.',
      caveats: input.caveats ?? [],
    },
    signals: [],
    evidenceSummary: {
      evidenceCount: 0,
      categories: [],
      eventTypes: [],
    },
    drillDown: {
      evidenceRefs: [],
    },
  });
