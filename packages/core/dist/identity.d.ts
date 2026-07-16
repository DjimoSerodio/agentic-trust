import { z } from 'zod';
export declare const HexAddressSchema: z.ZodString;
export declare const TrustIdentityKindSchema: z.ZodEnum<["coordination-game-alias", "erc-8004-agent", "ethereum-address", "did", "uri"]>;
export type TrustIdentityKind = z.infer<typeof TrustIdentityKindSchema>;
export declare const CoordinationGameAliasSchema: z.ZodObject<{
    alias: z.ZodString;
    namespace: z.ZodDefault<z.ZodString>;
    gameId: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    alias: string;
    namespace: string;
    gameId?: string | undefined;
}, {
    alias: string;
    namespace?: string | undefined;
    gameId?: string | undefined;
}>;
export type CoordinationGameAlias = z.infer<typeof CoordinationGameAliasSchema>;
export declare const Erc8004AgentIdentitySchema: z.ZodEffects<z.ZodObject<{
    chainId: z.ZodNumber;
    registryAddress: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    ownerAddress: z.ZodOptional<z.ZodString>;
    discoveryUri: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    chainId: number;
    registryAddress?: string | undefined;
    agentId?: string | undefined;
    ownerAddress?: string | undefined;
    discoveryUri?: string | undefined;
}, {
    chainId: number;
    registryAddress?: string | undefined;
    agentId?: string | undefined;
    ownerAddress?: string | undefined;
    discoveryUri?: string | undefined;
}>, {
    chainId: number;
    registryAddress?: string | undefined;
    agentId?: string | undefined;
    ownerAddress?: string | undefined;
    discoveryUri?: string | undefined;
}, {
    chainId: number;
    registryAddress?: string | undefined;
    agentId?: string | undefined;
    ownerAddress?: string | undefined;
    discoveryUri?: string | undefined;
}>;
export type Erc8004AgentIdentity = z.infer<typeof Erc8004AgentIdentitySchema>;
export declare const TrustAgentIdentityV1Schema: z.ZodEffects<z.ZodObject<{
    version: z.ZodLiteral<"trust-identity/v1">;
    kind: z.ZodEnum<["coordination-game-alias", "erc-8004-agent", "ethereum-address", "did", "uri"]>;
    id: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    coordinationGameAlias: z.ZodOptional<z.ZodObject<{
        alias: z.ZodString;
        namespace: z.ZodDefault<z.ZodString>;
        gameId: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        alias: string;
        namespace: string;
        gameId?: string | undefined;
    }, {
        alias: string;
        namespace?: string | undefined;
        gameId?: string | undefined;
    }>>;
    address: z.ZodOptional<z.ZodString>;
    erc8004: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        chainId: z.ZodNumber;
        registryAddress: z.ZodOptional<z.ZodString>;
        agentId: z.ZodOptional<z.ZodString>;
        ownerAddress: z.ZodOptional<z.ZodString>;
        discoveryUri: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    }, {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    }>, {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    }, {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    }>>;
    did: z.ZodOptional<z.ZodString>;
    uri: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    version: "trust-identity/v1";
    kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
    id: string;
    did?: string | undefined;
    uri?: string | undefined;
    displayName?: string | undefined;
    coordinationGameAlias?: {
        alias: string;
        namespace: string;
        gameId?: string | undefined;
    } | undefined;
    address?: string | undefined;
    erc8004?: {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    } | undefined;
}, {
    version: "trust-identity/v1";
    kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
    id: string;
    did?: string | undefined;
    uri?: string | undefined;
    displayName?: string | undefined;
    coordinationGameAlias?: {
        alias: string;
        namespace?: string | undefined;
        gameId?: string | undefined;
    } | undefined;
    address?: string | undefined;
    erc8004?: {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    } | undefined;
}>, {
    version: "trust-identity/v1";
    kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
    id: string;
    did?: string | undefined;
    uri?: string | undefined;
    displayName?: string | undefined;
    coordinationGameAlias?: {
        alias: string;
        namespace: string;
        gameId?: string | undefined;
    } | undefined;
    address?: string | undefined;
    erc8004?: {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    } | undefined;
}, {
    version: "trust-identity/v1";
    kind: "coordination-game-alias" | "erc-8004-agent" | "ethereum-address" | "did" | "uri";
    id: string;
    did?: string | undefined;
    uri?: string | undefined;
    displayName?: string | undefined;
    coordinationGameAlias?: {
        alias: string;
        namespace?: string | undefined;
        gameId?: string | undefined;
    } | undefined;
    address?: string | undefined;
    erc8004?: {
        chainId: number;
        registryAddress?: string | undefined;
        agentId?: string | undefined;
        ownerAddress?: string | undefined;
        discoveryUri?: string | undefined;
    } | undefined;
}>;
export type TrustAgentIdentityV1 = z.infer<typeof TrustAgentIdentityV1Schema>;
export declare const createCoordinationGameIdentity: (input: {
    readonly alias: string;
    readonly gameId?: string;
    readonly namespace?: string;
    readonly displayName?: string;
}) => TrustAgentIdentityV1;
export declare const createErc8004Identity: (input: {
    readonly chainId: number;
    readonly agentId?: string;
    readonly ownerAddress?: `0x${string}`;
    readonly registryAddress?: `0x${string}`;
    readonly discoveryUri?: string;
    readonly displayName?: string;
}) => TrustAgentIdentityV1;
//# sourceMappingURL=identity.d.ts.map