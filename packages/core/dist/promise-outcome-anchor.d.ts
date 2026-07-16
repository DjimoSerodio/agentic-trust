import { type EasGateway, type PromiseOutcomeAnchorResult, type PromiseOutcomeAnchorStore, type PromiseOutcomeQueryResult } from './promise-outcome-types.js';
export type PromiseOutcomeAnchor = {
    anchor(input: unknown, anchoredAt: string): Promise<PromiseOutcomeAnchorResult>;
    query(uid: string): Promise<PromiseOutcomeQueryResult>;
};
export declare function createInMemoryPromiseOutcomeAnchorStore(): PromiseOutcomeAnchorStore;
export declare function createPromiseOutcomeAnchor(gateway: EasGateway, store?: PromiseOutcomeAnchorStore): PromiseOutcomeAnchor;
//# sourceMappingURL=promise-outcome-anchor.d.ts.map