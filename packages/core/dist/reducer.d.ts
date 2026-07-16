import type { TrustEvidenceEnvelopeV1 } from './evidence.js';
import type { TrustAgentIdentityV1 } from './identity.js';
import type { TrustLexiconRegistry } from './lexicon.js';
import { type TrustCardV1 } from './trust-card.js';
export interface TrustReducerContext {
    readonly now: string;
    readonly lexicon?: TrustLexiconRegistry;
}
export interface TrustReducerInput {
    readonly subject: TrustAgentIdentityV1;
    readonly evidence: readonly TrustEvidenceEnvelopeV1[];
    readonly currentCard?: TrustCardV1;
}
export interface TrustReducerWarning {
    readonly code: string;
    readonly message: string;
    readonly evidenceIndex?: number;
}
export interface TrustReducerResult {
    readonly card: TrustCardV1;
    readonly consumedEvidenceHashes: readonly `0x${string}`[];
    readonly warnings: readonly TrustReducerWarning[];
}
export interface TrustReducer {
    readonly id: string;
    readonly version: string;
    reduce(input: TrustReducerInput, context: TrustReducerContext): TrustReducerResult | Promise<TrustReducerResult>;
}
export declare const createNoopTrustReducer: (options?: {
    readonly id?: string;
    readonly version?: string;
}) => TrustReducer;
//# sourceMappingURL=reducer.d.ts.map