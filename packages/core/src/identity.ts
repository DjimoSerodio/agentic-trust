import { z } from 'zod';

export const HexAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Expected a 20-byte 0x-prefixed EVM address');

export const TrustIdentityKindSchema = z.enum([
  'coordination-game-alias',
  'erc-8004-agent',
  'ethereum-address',
  'did',
  'uri',
]);

export type TrustIdentityKind = z.infer<typeof TrustIdentityKindSchema>;

export const CoordinationGameAliasSchema = z
  .object({
    alias: z.string().min(1).max(80),
    namespace: z.string().min(1).max(80).default('coordination-games'),
    gameId: z.string().min(1).max(120).optional(),
  })
  .strict();

export type CoordinationGameAlias = z.infer<typeof CoordinationGameAliasSchema>;

export const Erc8004AgentIdentitySchema = z
  .object({
    chainId: z.number().int().positive(),
    registryAddress: HexAddressSchema.optional(),
    agentId: z.string().min(1).max(128).optional(),
    ownerAddress: HexAddressSchema.optional(),
    discoveryUri: z.string().url().optional(),
  })
  .strict()
  .refine(
    (value) => value.agentId !== undefined || value.ownerAddress !== undefined,
    'ERC-8004 identities require an agentId or ownerAddress',
  );

export type Erc8004AgentIdentity = z.infer<typeof Erc8004AgentIdentitySchema>;

export const TrustAgentIdentityV1Schema = z
  .object({
    version: z.literal('trust-identity/v1'),
    kind: TrustIdentityKindSchema,
    id: z.string().min(1).max(256),
    displayName: z.string().min(1).max(120).optional(),
    coordinationGameAlias: CoordinationGameAliasSchema.optional(),
    address: HexAddressSchema.optional(),
    erc8004: Erc8004AgentIdentitySchema.optional(),
    did: z
      .string()
      .regex(/^did:[a-z0-9]+:.+$/i)
      .optional(),
    uri: z.string().url().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.kind === 'coordination-game-alias' && value.coordinationGameAlias === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coordinationGameAlias'],
        message: 'coordination-game-alias identities require coordinationGameAlias metadata',
      });
    }

    if (value.kind === 'erc-8004-agent' && value.erc8004 === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['erc8004'],
        message: 'erc-8004-agent identities require erc8004 metadata',
      });
    }

    if (value.kind === 'ethereum-address' && value.address === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: 'ethereum-address identities require address',
      });
    }

    if (value.kind === 'did' && value.did === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['did'],
        message: 'did identities require did',
      });
    }

    if (value.kind === 'uri' && value.uri === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['uri'],
        message: 'uri identities require uri',
      });
    }
  });

export type TrustAgentIdentityV1 = z.infer<typeof TrustAgentIdentityV1Schema>;

export const createCoordinationGameIdentity = (input: {
  readonly alias: string;
  readonly gameId?: string;
  readonly namespace?: string;
  readonly displayName?: string;
}): TrustAgentIdentityV1 => {
  const namespace = input.namespace ?? 'coordination-games';

  return TrustAgentIdentityV1Schema.parse({
    version: 'trust-identity/v1',
    kind: 'coordination-game-alias',
    id: `cg:${namespace}:${input.gameId ?? 'global'}:${input.alias}`,
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    coordinationGameAlias: {
      alias: input.alias,
      namespace,
      ...(input.gameId !== undefined ? { gameId: input.gameId } : {}),
    },
  });
};

export const createErc8004Identity = (input: {
  readonly chainId: number;
  readonly agentId?: string;
  readonly ownerAddress?: `0x${string}`;
  readonly registryAddress?: `0x${string}`;
  readonly discoveryUri?: string;
  readonly displayName?: string;
}): TrustAgentIdentityV1 => {
  const registryId = input.registryAddress ?? 'registry-unknown';
  const principalId = input.agentId ?? input.ownerAddress ?? 'agent-unknown';

  return TrustAgentIdentityV1Schema.parse({
    version: 'trust-identity/v1',
    kind: 'erc-8004-agent',
    id: `erc8004:${input.chainId}:${registryId}:${principalId}`,
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    erc8004: {
      chainId: input.chainId,
      ...(input.agentId !== undefined ? { agentId: input.agentId } : {}),
      ...(input.ownerAddress !== undefined ? { ownerAddress: input.ownerAddress } : {}),
      ...(input.registryAddress !== undefined ? { registryAddress: input.registryAddress } : {}),
      ...(input.discoveryUri !== undefined ? { discoveryUri: input.discoveryUri } : {}),
    },
  });
};
