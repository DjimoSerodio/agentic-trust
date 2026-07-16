import { type WalletBindingRecord } from './index.js';
import type { WalletBindingRejected, WalletBindingSigningRequest, WalletBindingStatement } from './wallet-binding-types.js';
export declare function parseWalletBindingStatement(input: unknown): {
    readonly kind: 'parsed';
    readonly statement: WalletBindingStatement;
} | WalletBindingRejected;
export declare function parseWalletBindingRecord(input: unknown): {
    readonly kind: 'parsed';
    readonly record: WalletBindingRecord;
} | WalletBindingRejected;
export declare function parseWalletBindingSigningRequest(input: unknown, address: string): {
    readonly kind: 'parsed';
    readonly request: WalletBindingSigningRequest;
    readonly statement: WalletBindingStatement;
} | WalletBindingRejected;
//# sourceMappingURL=wallet-binding-parse.d.ts.map