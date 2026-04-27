import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultPublishSafetyPolicy } from '@agentic-trust/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const uploadTextMock = vi.hoisted(() =>
  vi.fn<
    (
      text: string,
      apiKey: string,
      name?: string,
    ) => Promise<{ data: { Hash: string; Name: string; Size: string } }>
  >(),
);

vi.mock('@lighthouse-web3/sdk', () => ({
  default: {
    uploadText: uploadTextMock,
  },
}));

import {
  type TrustEvidenceEnvelopeV1,
  TrustEvidenceEnvelopeV1Schema,
  createCoordinationGameIdentity,
  createErc8004Identity,
} from '@agentic-trust/core';
import {
  EvidenceBundleV1Schema,
  EvidenceSignatureV1Schema,
  LighthousePublisher,
  LocalFilePublisher,
  NoopPublisher,
  agentWorkTrustLexiconEntries,
  canonicalizeEvidenceBundleV1,
  createBasicEvidenceTrustReducer,
  createEd25519SigningKeyPair,
  createEvidenceBundleV1,
  createPublisherTrustLexiconRegistry,
  hashEvidenceBundleV1,
  publisherTrustLexiconEntries,
  signEvidenceBundleV1,
  tragedyTrustLexiconEntries,
  verifyEvidenceBundleSignatureV1,
} from './index.js';

const observedAt = '2026-04-27T10:00:00.000Z';
const createdAt = '2026-04-27T10:01:00.000Z';

const subject = createCoordinationGameIdentity({ alias: 'trust-agent', gameId: 'tragedy-001' });
const otherSubject = createCoordinationGameIdentity({
  alias: 'other-agent',
  gameId: 'tragedy-001',
});
const issuer = createErc8004Identity({
  chainId: 8453,
  agentId: 'publisher-agent',
  ownerAddress: '0x1111111111111111111111111111111111111111',
});

const evidenceEnvelope = (
  overrides: Partial<TrustEvidenceEnvelopeV1> = {},
): TrustEvidenceEnvelopeV1 =>
  TrustEvidenceEnvelopeV1Schema.parse({
    version: 'trust-evidence/v1',
    eventType: 'tragedy.cooperation',
    category: 'behavior',
    subject,
    issuer,
    observedAt,
    createdAt,
    summary: 'Agent cooperated with a public Tragedy commitment using redacted evidence.',
    payload: {
      publicOutcome: 'cooperated',
      aggregateTurns: 3,
    },
    evidenceRefs: [
      {
        uri: 'ipfs://bafyredacted/summary.json',
        digestAlgorithm: 'keccak256',
        digest: '0x2222222222222222222222222222222222222222222222222222222222222222',
        mediaType: 'application/json',
        description: 'Redacted aggregate summary.',
      },
    ],
    privacy: defaultPublishSafetyPolicy('redacted'),
    ...overrides,
  });

describe('evidence bundles and lexicons', () => {
  it('creates deterministic bundles and exposes publisher lexicon entries', () => {
    const bundle = createEvidenceBundleV1({
      name: 'Tragedy Round',
      createdAt,
      envelopes: [evidenceEnvelope()],
    });
    const reparsed = EvidenceBundleV1Schema.parse({
      envelopes: bundle.envelopes,
      name: bundle.name,
      createdAt: bundle.createdAt,
      version: bundle.version,
    });

    expect(hashEvidenceBundleV1(bundle)).toBe(hashEvidenceBundleV1(reparsed));
    expect(canonicalizeEvidenceBundleV1(bundle)).toContain('tragedy.cooperation');
    expect(tragedyTrustLexiconEntries.map((entry) => entry.eventType)).toContain(
      'tragedy.turn.outcome',
    );
    expect(agentWorkTrustLexiconEntries.map((entry) => entry.eventType)).toContain(
      'agent.review.finding',
    );
    expect(publisherTrustLexiconEntries.every((entry) => entry.version === '1.0.0')).toBe(true);

    const registry = createPublisherTrustLexiconRegistry();
    expect(registry.has('tragedy.cooperation')).toBe(true);
    expect(
      registry.require('agent.capability.attestation').privacy.forbiddenPublishableContent,
    ).toContain('raw-private-chat');
  });
});

describe('publishers', () => {
  let tempDirectory: string | undefined;

  beforeEach(() => {
    uploadTextMock.mockReset();
  });

  afterEach(async () => {
    if (tempDirectory !== undefined) {
      await rm(tempDirectory, { recursive: true, force: true });
      tempDirectory = undefined;
    }
  });

  it('validates and hashes with the noop publisher without writing', async () => {
    const bundle = createEvidenceBundleV1({ createdAt, envelopes: [evidenceEnvelope()] });
    const publisher = new NoopPublisher({ registry: createPublisherTrustLexiconRegistry() });

    const result = await publisher.publish({ bundle });

    expect(result.publisher).toBe('noop');
    expect(result.uri).toBe(`urn:agentic-trust:noop:${hashEvidenceBundleV1(bundle)}`);
    expect(result.digest).toBe(hashEvidenceBundleV1(bundle));
    expect(result.byteLength).toBeGreaterThan(100);
  });

  it('writes canonical JSON bundles to local files with digest metadata', async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), 'agentic-trust-publishers-'));
    const bundle = createEvidenceBundleV1({
      name: 'Local Evidence',
      createdAt,
      envelopes: [evidenceEnvelope()],
    });
    const publisher = new LocalFilePublisher({
      directory: tempDirectory,
      registry: createPublisherTrustLexiconRegistry(),
    });

    const result = await publisher.publish({ bundle });

    expect(result.publisher).toBe('local-file');
    expect(result.uri.startsWith('file://')).toBe(true);
    expect(result.digest).toBe(hashEvidenceBundleV1(bundle));
    const filePath = decodeURIComponent(result.uri.replace('file://', ''));
    expect(await readFile(filePath, 'utf8')).toBe(canonicalizeEvidenceBundleV1(bundle));
  });

  it('uploads JSON bundles to Lighthouse using the configured API key only', async () => {
    uploadTextMock.mockResolvedValue({
      data: { Hash: 'bafylighthousecid', Name: 'bundle.json', Size: '123' },
    });
    const bundle = createEvidenceBundleV1({
      name: 'Remote Evidence',
      createdAt,
      envelopes: [evidenceEnvelope()],
    });
    const publisher = new LighthousePublisher({
      apiKey: 'test-api-key',
      registry: createPublisherTrustLexiconRegistry(),
    });

    const result = await publisher.publish({ bundle });

    expect(uploadTextMock).toHaveBeenCalledWith(
      canonicalizeEvidenceBundleV1(bundle),
      'test-api-key',
      expect.stringContaining(hashEvidenceBundleV1(bundle).slice(2)),
    );
    expect(result.cid).toBe('bafylighthousecid');
    expect(result.gatewayUrl).toBe('https://gateway.lighthouse.storage/ipfs/bafylighthousecid');
    expect(result.uri).toBe('ipfs://bafylighthousecid');
  });

  it('rejects Lighthouse upload responses without a CID', async () => {
    uploadTextMock.mockResolvedValue({
      data: { Hash: '', Name: 'bundle.json', Size: '123' },
    });
    const publisher = new LighthousePublisher({
      apiKey: 'test-api-key',
      registry: createPublisherTrustLexiconRegistry(),
    });

    await expect(
      publisher.publish({
        bundle: createEvidenceBundleV1({ createdAt, envelopes: [evidenceEnvelope()] }),
      }),
    ).rejects.toThrow('Lighthouse upload response did not include data.Hash');
  });

  it('rejects unsafe privacy flags and registry-unknown event types', async () => {
    const safeEnvelope = evidenceEnvelope();
    const unsafeEnvelope = {
      ...safeEnvelope,
      privacy: {
        ...safeEnvelope.privacy,
        containsPrivateChat: true,
      },
    };
    const unknownEnvelope = evidenceEnvelope({ eventType: 'unknown.event', category: 'behavior' });
    const publisher = new NoopPublisher({ registry: createPublisherTrustLexiconRegistry() });

    await expect(
      publisher.publish({
        bundle: {
          version: 'trust-evidence-bundle/v1',
          createdAt,
          envelopes: [unsafeEnvelope],
        },
      }),
    ).rejects.toThrow();
    await expect(
      publisher.publish({
        bundle: createEvidenceBundleV1({ createdAt, envelopes: [unknownEnvelope] }),
      }),
    ).rejects.toThrow('Envelope event type is not registered');

    const permissivePublisher = new NoopPublisher({
      registry: createPublisherTrustLexiconRegistry(),
      requireRegisteredEventTypes: false,
    });
    await expect(
      permissivePublisher.publish({
        bundle: createEvidenceBundleV1({ createdAt, envelopes: [unknownEnvelope] }),
      }),
    ).resolves.toMatchObject({ publisher: 'noop' });
  });
});

describe('signing', () => {
  it('signs bundle hashes and verifies tamper failures', () => {
    const keyPair = createEd25519SigningKeyPair();
    const bundle = createEvidenceBundleV1({ createdAt, envelopes: [evidenceEnvelope()] });
    const signature = signEvidenceBundleV1(bundle, keyPair);

    expect(signature.algorithm).toBe('ed25519');
    expect(signature.signedHash).toBe(hashEvidenceBundleV1(bundle));
    expect(verifyEvidenceBundleSignatureV1(bundle, signature)).toBe(true);

    const tamperedBundle = createEvidenceBundleV1({
      createdAt,
      envelopes: [evidenceEnvelope({ summary: 'A different public summary.' })],
    });
    expect(verifyEvidenceBundleSignatureV1(tamperedBundle, signature)).toBe(false);

    const tamperedSignature = EvidenceSignatureV1Schema.parse({
      ...signature,
      signedHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    });
    expect(verifyEvidenceBundleSignatureV1(bundle, tamperedSignature)).toBe(false);
  });
});

describe('basic evidence reducer', () => {
  it('reduces evidence to compact TrustCard signals without leaking payloads', () => {
    const reducer = createBasicEvidenceTrustReducer();
    const registeredEvidence = evidenceEnvelope();
    const unregisteredEvidence = evidenceEnvelope({
      eventType: 'agent.unregistered',
      category: 'outcome',
    });
    const mismatchedEvidence = evidenceEnvelope({ subject: otherSubject });

    const result = reducer.reduce(
      { subject, evidence: [registeredEvidence, unregisteredEvidence, mismatchedEvidence] },
      { now: createdAt, lexicon: createPublisherTrustLexiconRegistry() },
    );

    if (result instanceof Promise) {
      throw new Error('Basic reducer should be synchronous');
    }

    expect(result.card.subject.id).toBe(subject.id);
    expect(result.card.evidenceSummary.evidenceCount).toBe(2);
    expect(result.card.drillDown.evidenceRefs.every((ref) => ref.envelopeHash !== undefined)).toBe(
      true,
    );
    expect(result.card.signals.map((signal) => signal.label)).toContain('Tragedy cooperation');
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      'unregistered-event-type',
      'subject-mismatch',
    ]);
    expect(JSON.stringify(result.card)).not.toContain('publicOutcome');
    expect(JSON.stringify(result.card)).not.toContain('aggregateTurns');
  });
});
