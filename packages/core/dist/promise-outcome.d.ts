import { type Bytes32, type DecodedPromiseOutcomeResult, type PromiseOutcomeCreationResult } from './promise-outcome-types.js';
export declare function getPromiseOutcomeSchemaUid(resolver: string, revocable: boolean): Bytes32;
export declare function createPromiseOutcomeAttestation(input: unknown): PromiseOutcomeCreationResult;
export declare function decodePromiseOutcomeEasData(data: unknown): DecodedPromiseOutcomeResult;
//# sourceMappingURL=promise-outcome.d.ts.map