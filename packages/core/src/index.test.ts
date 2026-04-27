import { describe, expect, it } from 'vitest';

import {
  TrustAgentIdentityV1Schema,
  TrustCardV1Schema,
  type TrustEvidenceEnvelopeV1,
  TrustEvidenceEnvelopeV1Schema,
  type TrustLexiconEntryV1,
  TrustLexiconRegistry,
  type TrustReducer,
  canonicalizeJson,
  createCoordinationGameIdentity,
  createEmptyTrustCardV1,
  createErc8004Identity,
  createNoopTrustReducer,
  defaultPublishSafetyPolicy,
  hashTrustEvidenceEnvelopeV1,
  keccak256CanonicalJson,
  parseTrustEvidenceEnvelopeV1,
} from './index.js';

const observedAt = '2026-04-27T10:00:00.000Z';
const createdAt = '2026-04-27T10:01:00.000Z';

const subject = createCoordinationGameIdentity({ alias: 'lobster-agent', gameId: 'capture-001' });
const issuer = createErc8004Identity({
  chainId: 8453,
  agentId: 'agent-7',
  ownerAddress: '0x1111111111111111111111111111111111111111',
});

const lexiconEntry = (version: string): TrustLexiconEntryV1 => ({
  schemaVersion: 'trust-lexicon-entry/v1',
  eventType: 'coordination.outcome',
  version,
  category: 'outcome',
  title: `Coordination outcome ${version}`,
  description: 'A publishable summary of a Coordination Games outcome.',
  privacy: {
    publicByDefault: true,
    redactionRequired: true,
    allowedRedactionLevels: ['redacted', 'aggregated'],
    forbiddenPublishableContent: [
      'raw-private-chat',
      'hidden-strategy',
      'full-per-tick-state',
      'unredacted-private-commitment',
    ],
  },
  payloadGuidance:
    'Use aggregate outcome fields only; never include raw ticks or private commitments.',
  deprecated: false,
});

const evidenceEnvelope = (): TrustEvidenceEnvelopeV1 =>
  TrustEvidenceEnvelopeV1Schema.parse({
    version: 'trust-evidence/v1',
    eventType: 'coordination.outcome',
    category: 'outcome',
    subject,
    issuer,
    observedAt,
    createdAt,
    summary: 'Agent completed a coordination round with publishable aggregate evidence.',
    payload: {
      game: 'capture-the-lobster',
      outcome: 'coordinated',
      aggregateTurns: 12,
      publicSignals: ['commitment-honored', 'no-secret-state'],
    },
    evidenceRefs: [
      {
        uri: 'ipfs://bafyexample/redacted-summary.json',
        digestAlgorithm: 'keccak256',
        digest: '0x2222222222222222222222222222222222222222222222222222222222222222',
        mediaType: 'application/json',
        description: 'Redacted aggregate summary only.',
      },
    ],
    privacy: defaultPublishSafetyPolicy('redacted'),
  });

describe('canonical JSON', () => {
  it('sorts object keys recursively while preserving array order', () => {
    const left = {
      z: true,
      a: { d: 4, c: [{ z: 1, a: 2 }] },
      b: ['second', 'first'],
    };
    const right = {
      b: ['second', 'first'],
      a: { c: [{ a: 2, z: 1 }], d: 4 },
      z: true,
    };

    expect(canonicalizeJson(left)).toBe(
      '{"a":{"c":[{"a":2,"z":1}],"d":4},"b":["second","first"],"z":true}',
    );
    expect(canonicalizeJson(left)).toBe(canonicalizeJson(right));
  });

  it('rejects unsupported JSON values instead of silently dropping them', () => {
    expect(() => canonicalizeJson({ value: undefined })).toThrow('Undefined is not valid JSON');
    expect(() => canonicalizeJson({ value: Number.POSITIVE_INFINITY })).toThrow(
      'Non-finite numbers are not valid JSON',
    );
    expect(() => canonicalizeJson({ value: 1n })).toThrow('Bigint is not valid JSON');
    expect(() => canonicalizeJson({ value: Symbol('hidden') })).toThrow(
      'Symbols are not valid JSON',
    );
    expect(() => canonicalizeJson({ value: () => true })).toThrow('Functions are not valid JSON');
    expect(() => canonicalizeJson(new Date('2026-04-27T00:00:00Z'))).toThrow(
      'Only plain objects are valid JSON objects',
    );
  });

  it('produces stable 0x keccak256 hashes for semantically identical JSON', () => {
    const leftHash = keccak256CanonicalJson({ b: 2, a: 1 });
    const rightHash = keccak256CanonicalJson({ a: 1, b: 2 });
    const changedHash = keccak256CanonicalJson({ a: 1, b: 3 });

    expect(leftHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(leftHash).toBe(rightHash);
    expect(leftHash).not.toBe(changedHash);
  });
});

describe('identity and evidence schemas', () => {
  it('validates Coordination Games aliases and ERC-8004-backed identities', () => {
    expect(TrustAgentIdentityV1Schema.parse(subject).kind).toBe('coordination-game-alias');
    expect(TrustAgentIdentityV1Schema.parse(issuer).kind).toBe('erc-8004-agent');

    expect(
      TrustAgentIdentityV1Schema.safeParse({
        version: 'trust-identity/v1',
        kind: 'coordination-game-alias',
        id: 'cg:missing-metadata',
      }).success,
    ).toBe(false);
  });

  it('validates publishable evidence envelopes and rejects unsafe private content flags', () => {
    const envelope = evidenceEnvelope();

    expect(parseTrustEvidenceEnvelopeV1(envelope).payload.outcome).toBe('coordinated');
    expect(hashTrustEvidenceEnvelopeV1(envelope)).toMatch(/^0x[a-f0-9]{64}$/);

    expect(
      TrustEvidenceEnvelopeV1Schema.safeParse({
        ...envelope,
        privacy: {
          ...envelope.privacy,
          containsPrivateChat: true,
        },
      }).success,
    ).toBe(false);

    expect(
      TrustEvidenceEnvelopeV1Schema.safeParse({
        ...envelope,
        payload: { rawPrivateChat: undefined },
      }).success,
    ).toBe(false);

    expect(
      TrustEvidenceEnvelopeV1Schema.safeParse({
        ...envelope,
        evidenceRefs: [
          {
            uri: 'ipfs://bafyexample/missing-algorithm.json',
            digest: '0x2222222222222222222222222222222222222222222222222222222222222222',
          },
        ],
      }).success,
    ).toBe(false);
  });

  it('rejects non-JSON payload values at the envelope schema boundary', () => {
    const envelope = evidenceEnvelope();

    for (const payload of [
      { capturedAt: new Date('2026-04-27T00:00:00.000Z') },
      { value: 1n },
      { deriveSecret: () => 'private' },
    ]) {
      expect(
        TrustEvidenceEnvelopeV1Schema.safeParse({
          ...envelope,
          payload,
        }).success,
      ).toBe(false);
    }
  });

  it('allows explicit self-attestation without treating it as third-party evidence', () => {
    const envelope = TrustEvidenceEnvelopeV1Schema.parse({
      ...evidenceEnvelope(),
      issuer: subject,
    });

    expect(envelope.issuer.id).toBe(envelope.subject.id);
  });
});

describe('lexicon registry', () => {
  it('registers, versions, and looks up event definitions with privacy metadata', () => {
    const registry = new TrustLexiconRegistry();

    registry.register(lexiconEntry('1.0.0'));
    registry.register(lexiconEntry('1.10.0'));

    expect(registry.has('coordination.outcome', '1.0.0')).toBe(true);
    expect(registry.get('coordination.outcome')?.version).toBe('1.10.0');
    expect(registry.listByCategory('outcome')).toHaveLength(2);
    expect(registry.require('coordination.outcome').privacy.forbiddenPublishableContent).toContain(
      'hidden-strategy',
    );
    expect(() => registry.register(lexiconEntry('1.0.0'))).toThrow(
      'Lexicon entry already registered',
    );
  });
});

describe('reducers and TrustCard projections', () => {
  it('provides a no-op reducer that is type-compatible with Wave 2 reducers', () => {
    const reducer = createNoopTrustReducer({ id: 'wave-two-placeholder' }) satisfies TrustReducer;
    const result = reducer.reduce(
      { subject, evidence: [evidenceEnvelope()] },
      { now: createdAt, lexicon: new TrustLexiconRegistry([lexiconEntry('1.0.0')]) },
    );

    expect(result).not.toBeInstanceOf(Promise);
    if (result instanceof Promise) {
      throw new Error('No-op reducer should be synchronous');
    }

    expect(result.card.subject.id).toBe(subject.id);
    expect(result.card.summary.compact).toContain('No publishable evidence');
    expect(result.consumedEvidenceHashes).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('models compact TrustCards with drill-down evidence references only', () => {
    const envelope = evidenceEnvelope();
    const envelopeHash = hashTrustEvidenceEnvelopeV1(envelope);
    const card = TrustCardV1Schema.parse({
      ...createEmptyTrustCardV1({ subject, generatedAt: createdAt }),
      headline: 'Agent has one redacted coordination outcome',
      summary: {
        compact: 'One publishable aggregate outcome is available for inspection.',
        caveats: ['Evidence is redacted and does not expose private strategy.'],
      },
      signals: [
        {
          label: 'Coordination outcome',
          stance: 'positive',
          confidence: 0.8,
          description: 'Derived from an aggregate event, not a trust score database.',
          evidenceRefs: [
            {
              envelopeHash,
              eventType: envelope.eventType,
              category: envelope.category,
              observedAt: envelope.observedAt,
              summary: envelope.summary,
            },
          ],
        },
      ],
      evidenceSummary: {
        evidenceCount: 1,
        categories: [envelope.category],
        eventTypes: [envelope.eventType],
        latestObservedAt: envelope.observedAt,
      },
      drillDown: {
        evidenceRefs: [
          {
            envelopeHash,
            eventType: envelope.eventType,
            category: envelope.category,
            observedAt: envelope.observedAt,
            summary: envelope.summary,
          },
        ],
      },
    });

    expect(card.drillDown.evidenceRefs[0]?.envelopeHash).toBe(envelopeHash);
    expect(JSON.stringify(card)).not.toContain('rawPrivateChat');
  });
});
