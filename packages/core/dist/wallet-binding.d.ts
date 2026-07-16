import type { NonceConsumer, WalletBindingCreationResult, WalletBindingExpectation, WalletBindingSigner, WalletBindingVerificationResult } from './wallet-binding-types.js';
export declare function createMemoryNonceConsumer(): NonceConsumer;
export declare function createWalletBindingRecord(request: unknown, signer: WalletBindingSigner): Promise<WalletBindingCreationResult>;
export declare function verifyWalletBindingRecord(input: unknown, expected: WalletBindingExpectation, nonceConsumer: NonceConsumer): WalletBindingVerificationResult;
//# sourceMappingURL=wallet-binding.d.ts.map