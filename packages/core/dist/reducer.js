import { createEmptyTrustCardV1 } from './trust-card.js';
export const createNoopTrustReducer = (options = {}) => ({
    id: options.id ?? 'noop',
    version: options.version ?? '0.1.0',
    reduce: (input, context) => ({
        card: input.currentCard ??
            createEmptyTrustCardV1({
                subject: input.subject,
                generatedAt: context.now,
                caveats: ['No reducer logic has been applied; evidence was intentionally left untouched.'],
            }),
        consumedEvidenceHashes: [],
        warnings: [],
    }),
});
//# sourceMappingURL=reducer.js.map