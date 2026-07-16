import { z } from 'zod';
import { EvidenceEventCategorySchema, EvidenceEventTypeSchema, } from './evidence.js';
export const LexiconPrivacyPolicyMetadataSchema = z
    .object({
    publicByDefault: z.boolean(),
    redactionRequired: z.boolean(),
    allowedRedactionLevels: z.array(z.enum(['none-needed', 'redacted', 'aggregated'])).min(1),
    forbiddenPublishableContent: z
        .array(z.enum([
        'raw-private-chat',
        'hidden-strategy',
        'full-per-tick-state',
        'unredacted-private-commitment',
    ]))
        .min(1),
})
    .strict();
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
export class TrustLexiconRegistry {
    entries = new Map();
    constructor(entries = []) {
        for (const entry of entries) {
            this.register(entry);
        }
    }
    register(entry) {
        const parsed = TrustLexiconEntryV1Schema.parse(entry);
        const key = lexiconKey(parsed.eventType, parsed.version);
        if (this.entries.has(key)) {
            throw new Error(`Lexicon entry already registered: ${key}`);
        }
        this.entries.set(key, parsed);
        return parsed;
    }
    get(eventType, version) {
        if (version !== undefined) {
            return this.entries.get(lexiconKey(eventType, version));
        }
        return this.listByEventType(eventType).at(-1);
    }
    require(eventType, version) {
        const entry = this.get(eventType, version);
        if (entry === undefined) {
            throw new Error(version === undefined
                ? `Lexicon event type is not registered: ${eventType}`
                : `Lexicon entry is not registered: ${lexiconKey(eventType, version)}`);
        }
        return entry;
    }
    has(eventType, version) {
        return this.get(eventType, version) !== undefined;
    }
    list() {
        return [...this.entries.values()].sort(compareLexiconEntries);
    }
    listByCategory(category) {
        return this.list().filter((entry) => entry.category === category);
    }
    listByEventType(eventType) {
        return this.list().filter((entry) => entry.eventType === eventType);
    }
}
export const lexiconKey = (eventType, version) => `${eventType}@${version}`;
const compareLexiconEntries = (left, right) => {
    const eventTypeOrder = left.eventType.localeCompare(right.eventType);
    if (eventTypeOrder !== 0) {
        return eventTypeOrder;
    }
    return compareSemver(left.version, right.version);
};
const compareSemver = (left, right) => {
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
export const createTrustLexiconRegistry = (entries = []) => new TrustLexiconRegistry(entries);
//# sourceMappingURL=lexicon.js.map