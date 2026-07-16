import type { Bytes32, EasGateway, EasGatewayConfig, EthersEasContract, EthersEasGateway } from './promise-outcome-types.js';
export declare const EAS_CONTRACT_ABI: readonly ["function attest((bytes32 schema,(address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value) data) request) payable returns (bytes32)", "function getAttestation(bytes32 uid) view returns ((bytes32 uid,bytes32 schema,uint64 time,uint64 expirationTime,uint64 revocationTime,bytes32 refUID,address recipient,address attester,bool revocable,bytes data) attestation)", "event Attested(address indexed recipient,address indexed attester,bytes32 uid,bytes32 indexed schemaUID)"];
export declare function createEthersEasGateway(config: EasGatewayConfig, contract: EthersEasContract): EthersEasGateway;
export type InMemoryEasGateway = EasGateway & {
    tamper(uid: Bytes32, changes: Readonly<Record<string, unknown>>): void;
};
export declare function createInMemoryEasGateway(config: EasGatewayConfig): InMemoryEasGateway;
//# sourceMappingURL=eas-gateway.d.ts.map