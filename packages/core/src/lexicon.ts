import { z } from 'zod';

import {
  type EvidenceEventCategory,
  EvidenceEventCategorySchema,
  EvidenceEventTypeSchema,
} from './evidence.js';

export const LexiconPrivacyPolicyMetadataSchema = z
  .object({
    publicByDefault: z.boolean(),
    redactionRequired: z.boolean(),
    allowedRedactionLevels: z.array(z.enum(['none-needed', 'redacted', 'aggregated'])).min(1),
    forbiddenPublishableContent: z
      .array(
        z.enum([
          'raw-private-chat',
          'hidden-strategy',
          'full-per-tick-state',
          'unredacted-private-commitment',
        ]),
      )
      .min(1),
  })
  .strict();

export type LexiconPrivacyPolicyMetadata = z.infer<typeof LexiconPrivacyPolicyMetadataSchema>;

export const TrustLexiconEntryV1Schema = z
  .object({
    schemaVersion: z.literal('trust-lexicon-entry/v1'),
    eventType: EvidenceEventTypeSchema,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    category: EvidenceEventCategorySchema,
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    privacy: LexiconPrivacyPolicyMetadataSchema,
    payloadGuidance: z.string().max(500).optional(),
    deprecated: z.boolean().default(false),
  })
  .strict();

export type TrustLexiconEntryV1 = z.infer<typeof TrustLexiconEntryV1Schema>;

export class TrustLexiconRegistry {
  private readonly entries = new Map<string, TrustLexiconEntryV1>();

  constructor(entries: readonly TrustLexiconEntryV1[] = []) {
    for (const entry of entries) {
      this.register(entry);
    }
  }

  register(entry: TrustLexiconEntryV1): TrustLexiconEntryV1 {
    const parsed = TrustLexiconEntryV1Schema.parse(entry);
    const key = lexiconKey(parsed.eventType, parsed.version);

    if (this.entries.has(key)) {
      throw new Error(`Lexicon entry already registered: ${key}`);
    }

    this.entries.set(key, parsed);
    return parsed;
  }

  get(eventType: string, version?: string): TrustLexiconEntryV1 | undefined {
    if (version !== undefined) {
      return this.entries.get(lexiconKey(eventType, version));
    }

    return this.listByEventType(eventType).at(-1);
  }

  require(eventType: string, version?: string): TrustLexiconEntryV1 {
    const entry = this.get(eventType, version);
    if (entry === undefined) {
      throw new Error(
        version === undefined
          ? `Lexicon event type is not registered: ${eventType}`
          : `Lexicon entry is not registered: ${lexiconKey(eventType, version)}`,
      );
    }
    return entry;
  }

  has(eventType: string, version?: string): boolean {
    return this.get(eventType, version) !== undefined;
  }

  list(): readonly TrustLexiconEntryV1[] {
    return [...this.entries.values()].sort(compareLexiconEntries);
  }

  listByCategory(category: EvidenceEventCategory): readonly TrustLexiconEntryV1[] {
    return this.list().filter((entry) => entry.category === category);
  }

  listByEventType(eventType: string): readonly TrustLexiconEntryV1[] {
    return this.list().filter((entry) => entry.eventType === eventType);
  }
}

export const lexiconKey = (eventType: string, version: string): string => `${eventType}@${version}`;

const compareLexiconEntries = (left: TrustLexiconEntryV1, right: TrustLexiconEntryV1): number => {
  const eventTypeOrder = left.eventType.localeCompare(right.eventType);
  if (eventTypeOrder !== 0) {
    return eventTypeOrder;
  }
  return compareSemver(left.version, right.version);
};

const compareSemver = (left: string, right: string): number => {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (leftPart !== rightPart) {
      return leftPart - rightPart;
    }
  }

  return 0;
};

export const createTrustLexiconRegistry = (
  entries: readonly TrustLexiconEntryV1[] = [],
): TrustLexiconRegistry => new TrustLexiconRegistry(entries);
