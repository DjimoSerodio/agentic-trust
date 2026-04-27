import { generateKeyPairSync, sign, verify } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  type EvidenceEventCategory,
  type JsonObject,
  type TrustAgentIdentityV1,
  type TrustCardV1,
  TrustCardV1Schema,
  type TrustEvidenceEnvelopeV1,
  TrustEvidenceEnvelopeV1Schema,
  type TrustEvidenceRef,
  type TrustLexiconEntryV1,
  TrustLexiconEntryV1Schema,
  type TrustLexiconRegistry,
  type TrustReducer,
  type TrustReducerContext,
  type TrustReducerInput,
  type TrustReducerResult,
  type TrustReducerWarning,
  canonicalizeJson,
  createEmptyTrustCardV1,
  createTrustLexiconRegistry,
  hashTrustEvidenceEnvelopeV1,
  keccak256CanonicalJson,
} from '@agentic-trust/core';
import lighthouse from '@lighthouse-web3/sdk';

export interface EvidenceBundleV1 {
  readonly version: 'trust-evidence-bundle/v1';
  readonly createdAt: string;
  readonly name?: string;
  readonly envelopes: readonly TrustEvidenceEnvelopeV1[];
}

export interface EvidenceSignatureV1 {
  readonly schemaVersion: 'trust-evidence-signature/v1';
  readonly algorithm: 'ed25519';
  readonly signedHash: `0x${string}`;
  readonly publicKeyPem: string;
  readonly signatureBase64: string;
}

export type SchemaParseResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: Error };

export const EvidenceBundleV1Schema = {
  parse(value: unknown): EvidenceBundleV1 {
    return parseEvidenceBundleV1(value);
  },
  safeParse(value: unknown): SchemaParseResult<EvidenceBundleV1> {
    try {
      return { success: true, data: parseEvidenceBundleV1(value) };
    } catch (error) {
      return { success: false, error: toError(error) };
    }
  },
} as const;

export const EvidenceSignatureV1Schema = {
  parse(value: unknown): EvidenceSignatureV1 {
    return parseEvidenceSignatureV1(value);
  },
  safeParse(value: unknown): SchemaParseResult<EvidenceSignatureV1> {
    try {
      return { success: true, data: parseEvidenceSignatureV1(value) };
    } catch (error) {
      return { success: false, error: toError(error) };
    }
  },
} as const;

export interface CreateEvidenceBundleInput {
  readonly envelopes: readonly unknown[];
  readonly createdAt: string;
  readonly name?: string;
}

export const createEvidenceBundleV1 = (input: CreateEvidenceBundleInput): EvidenceBundleV1 =>
  EvidenceBundleV1Schema.parse({
    version: 'trust-evidence-bundle/v1',
    createdAt: input.createdAt,
    ...(input.name !== undefined ? { name: input.name } : {}),
    envelopes: input.envelopes,
  });

export const canonicalizeEvidenceBundleV1 = (bundle: EvidenceBundleV1): string =>
  canonicalizeJson(EvidenceBundleV1Schema.parse(bundle));

export const hashEvidenceBundleV1 = (bundle: EvidenceBundleV1): `0x${string}` =>
  keccak256CanonicalJson(EvidenceBundleV1Schema.parse(bundle));

export interface PublisherValidationOptions {
  readonly registry?: TrustLexiconRegistry;
  readonly requireRegisteredEventTypes?: boolean;
}

export interface PublishEvidenceBundleInput extends PublisherValidationOptions {
  readonly bundle?: unknown;
  readonly envelopes?: readonly unknown[];
  readonly createdAt?: string;
  readonly name?: string;
}

export interface PublishEvidenceBundleResult {
  readonly publisher: 'noop' | 'local-file' | 'lighthouse';
  readonly uri: string;
  readonly digestAlgorithm: 'keccak256';
  readonly digest: `0x${string}`;
  readonly byteLength: number;
  readonly mediaType: 'application/json';
  readonly cid?: string;
  readonly gatewayUrl?: string;
}

interface PreparedBundle {
  readonly bundle: EvidenceBundleV1;
  readonly canonicalJson: string;
  readonly digest: `0x${string}`;
  readonly byteLength: number;
}

export class NoopPublisher {
  readonly id = 'noop';

  constructor(private readonly options: PublisherValidationOptions = {}) {}

  async publish(input: PublishEvidenceBundleInput): Promise<PublishEvidenceBundleResult> {
    const prepared = prepareBundle(input, this.options);
    return {
      publisher: 'noop',
      uri: `urn:agentic-trust:noop:${prepared.digest}`,
      digestAlgorithm: 'keccak256',
      digest: prepared.digest,
      byteLength: prepared.byteLength,
      mediaType: 'application/json',
    };
  }
}

export interface LocalFilePublisherOptions extends PublisherValidationOptions {
  readonly directory: string;
  readonly returnFileUri?: boolean;
}

export class LocalFilePublisher {
  readonly id = 'local-file';

  constructor(private readonly options: LocalFilePublisherOptions) {}

  async publish(input: PublishEvidenceBundleInput): Promise<PublishEvidenceBundleResult> {
    const prepared = prepareBundle(input, this.options);
    await mkdir(this.options.directory, { recursive: true });
    const fileName = `${safeFileStem(input.name ?? prepared.bundle.name ?? prepared.digest.slice(2))}-${prepared.digest.slice(2)}.json`;
    const filePath = join(this.options.directory, fileName);
    await writeFile(filePath, prepared.canonicalJson, 'utf8');

    return {
      publisher: 'local-file',
      uri: this.options.returnFileUri === false ? filePath : pathToFileURL(filePath).href,
      digestAlgorithm: 'keccak256',
      digest: prepared.digest,
      byteLength: prepared.byteLength,
      mediaType: 'application/json',
    };
  }
}

export interface LighthousePublisherOptions extends PublisherValidationOptions {
  readonly apiKey: string;
}

export class LighthousePublisher {
  readonly id = 'lighthouse';

  constructor(private readonly options: LighthousePublisherOptions) {
    if (options.apiKey.trim().length === 0) {
      throw new Error('LighthousePublisher requires a non-empty API key option');
    }
  }

  async publish(input: PublishEvidenceBundleInput): Promise<PublishEvidenceBundleResult> {
    const prepared = prepareBundle(input, this.options);
    const uploadName = `${safeFileStem(input.name ?? prepared.bundle.name ?? 'trust-evidence')}-${prepared.digest.slice(2)}.json`;
    const response = await lighthouse.uploadText(
      prepared.canonicalJson,
      this.options.apiKey,
      uploadName,
    );
    const cid = readLighthouseCid(response.data);

    return {
      publisher: 'lighthouse',
      uri: `ipfs://${cid}`,
      digestAlgorithm: 'keccak256',
      digest: prepared.digest,
      byteLength: prepared.byteLength,
      mediaType: 'application/json',
      cid,
      gatewayUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    };
  }
}

export interface Ed25519SigningKeyPair {
  readonly algorithm: 'ed25519';
  readonly publicKeyPem: string;
  readonly privateKeyPem: string;
}

export const createEd25519SigningKeyPair = (): Ed25519SigningKeyPair => {
  const keyPair = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return {
    algorithm: 'ed25519',
    publicKeyPem: keyPair.publicKey,
    privateKeyPem: keyPair.privateKey,
  };
};

export const signEvidenceBundleV1 = (
  bundle: EvidenceBundleV1,
  keyPair: Pick<Ed25519SigningKeyPair, 'privateKeyPem' | 'publicKeyPem'>,
): EvidenceSignatureV1 => {
  const signedHash = hashEvidenceBundleV1(bundle);
  const signatureBase64 = sign(null, hexToBytes(signedHash), keyPair.privateKeyPem).toString(
    'base64',
  );

  return EvidenceSignatureV1Schema.parse({
    schemaVersion: 'trust-evidence-signature/v1',
    algorithm: 'ed25519',
    signedHash,
    publicKeyPem: keyPair.publicKeyPem,
    signatureBase64,
  });
};

export const verifyEvidenceBundleSignatureV1 = (
  bundle: EvidenceBundleV1,
  signature: EvidenceSignatureV1,
): boolean => {
  const parsedBundle = EvidenceBundleV1Schema.parse(bundle);
  const parsedSignature = EvidenceSignatureV1Schema.parse(signature);
  const expectedHash = hashEvidenceBundleV1(parsedBundle);
  if (parsedSignature.signedHash !== expectedHash) {
    return false;
  }

  return verify(
    null,
    hexToBytes(parsedSignature.signedHash),
    parsedSignature.publicKeyPem,
    Buffer.from(parsedSignature.signatureBase64, 'base64'),
  );
};

const forbiddenContent = [
  'raw-private-chat',
  'hidden-strategy',
  'full-per-tick-state',
  'unredacted-private-commitment',
] as const;

const privacySafe = {
  publicByDefault: true,
  redactionRequired: true,
  allowedRedactionLevels: ['redacted', 'aggregated'],
  forbiddenPublishableContent: forbiddenContent,
} as const;

export const tragedyTrustLexiconEntries: readonly TrustLexiconEntryV1[] = [
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'tragedy.cooperation',
    version: '1.0.0',
    category: 'behavior',
    title: 'Tragedy cooperation',
    description: 'A privacy-safe attestation that an agent cooperated in a Tragedy-style round.',
    privacy: privacySafe,
    payloadGuidance:
      'Publish aggregate cooperation labels only; do not include chat, hidden strategy, or tick state.',
    deprecated: false,
  },
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'tragedy.defection',
    version: '1.0.0',
    category: 'behavior',
    title: 'Tragedy defection',
    description:
      'A privacy-safe attestation that an agent defected from a public Tragedy commitment.',
    privacy: privacySafe,
    payloadGuidance: 'Publish the public outcome label and redacted rationale only.',
    deprecated: false,
  },
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'tragedy.turn.outcome',
    version: '1.0.0',
    category: 'outcome',
    title: 'Tragedy turn outcome',
    description: 'A redacted or aggregate per-turn outcome suitable for publication.',
    privacy: privacySafe,
    payloadGuidance:
      'Use aggregate turn number and public outcome fields; never publish full per-tick state.',
    deprecated: false,
  },
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'tragedy.attestation',
    version: '1.0.0',
    category: 'attestation',
    title: 'Tragedy attestation',
    description: 'A third-party or system attestation over redacted Tragedy evidence.',
    privacy: privacySafe,
    payloadGuidance: 'Reference hashed envelopes or public aggregate summaries only.',
    deprecated: false,
  },
].map((entry) => TrustLexiconEntryV1Schema.parse(entry));

export const agentWorkTrustLexiconEntries: readonly TrustLexiconEntryV1[] = [
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'agent.task.completed',
    version: '1.0.0',
    category: 'outcome',
    title: 'Agent task completed',
    description: 'A compact publishable record that an agent completed a delegated task.',
    privacy: privacySafe,
    payloadGuidance:
      'Include task class and public result status only; omit private prompts or hidden chain-of-thought.',
    deprecated: false,
  },
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'agent.review.finding',
    version: '1.0.0',
    category: 'attestation',
    title: 'Agent review finding',
    description: 'A publishable review finding over agent work products.',
    privacy: privacySafe,
    payloadGuidance:
      'Publish severity, public artifact references, and redacted finding summaries only.',
    deprecated: false,
  },
  {
    schemaVersion: 'trust-lexicon-entry/v1',
    eventType: 'agent.capability.attestation',
    version: '1.0.0',
    category: 'capability',
    title: 'Agent capability attestation',
    description: 'A public or redacted attestation that an agent demonstrated a capability.',
    privacy: privacySafe,
    payloadGuidance:
      'Use capability names and public evidence references, not raw private interaction logs.',
    deprecated: false,
  },
].map((entry) => TrustLexiconEntryV1Schema.parse(entry));

export const publisherTrustLexiconEntries: readonly TrustLexiconEntryV1[] = [
  ...tragedyTrustLexiconEntries,
  ...agentWorkTrustLexiconEntries,
];

export const createPublisherTrustLexiconRegistry = (
  entries: readonly TrustLexiconEntryV1[] = publisherTrustLexiconEntries,
): TrustLexiconRegistry => createTrustLexiconRegistry(entries);

export interface BasicEvidenceTrustReducerOptions {
  readonly id?: string;
  readonly version?: string;
}

export const createBasicEvidenceTrustReducer = (
  options: BasicEvidenceTrustReducerOptions = {},
): TrustReducer => ({
  id: options.id ?? 'basic-evidence-to-trust-card',
  version: options.version ?? '0.1.0',
  reduce(input: TrustReducerInput, context: TrustReducerContext): TrustReducerResult {
    return reduceEvidenceToTrustCard(input, context);
  },
});

export const reduceEvidenceToTrustCard = (
  input: TrustReducerInput,
  context: TrustReducerContext,
): TrustReducerResult => {
  const warnings: TrustReducerWarning[] = [];
  const evidenceRefs: TrustEvidenceRef[] = [];
  const consumedEvidenceHashes: `0x${string}`[] = [];
  const grouped = new Map<string, { category: EvidenceEventCategory; refs: TrustEvidenceRef[] }>();
  const categories = new Set<EvidenceEventCategory>();
  const eventTypes = new Set<string>();
  let latestObservedAt: string | undefined;

  input.evidence.forEach((candidate, evidenceIndex) => {
    const parsed = TrustEvidenceEnvelopeV1Schema.safeParse(candidate);
    if (!parsed.success) {
      warnings.push({
        code: 'invalid-evidence',
        message: 'Evidence envelope failed core schema validation and was skipped.',
        evidenceIndex,
      });
      return;
    }

    const envelope = parsed.data;
    if (!sameIdentity(envelope.subject, input.subject)) {
      warnings.push({
        code: 'subject-mismatch',
        message: `Evidence subject ${envelope.subject.id} does not match TrustCard subject ${input.subject.id}.`,
        evidenceIndex,
      });
      return;
    }

    if (context.lexicon !== undefined && !context.lexicon.has(envelope.eventType)) {
      warnings.push({
        code: 'unregistered-event-type',
        message: `Evidence event type is not registered in the provided lexicon: ${envelope.eventType}.`,
        evidenceIndex,
      });
    }

    const envelopeHash = hashTrustEvidenceEnvelopeV1(envelope);
    const ref: TrustEvidenceRef = {
      envelopeHash,
      eventType: envelope.eventType,
      category: envelope.category,
      observedAt: envelope.observedAt,
      summary: truncate(envelope.summary, 240),
    };
    evidenceRefs.push(ref);
    consumedEvidenceHashes.push(envelopeHash);
    categories.add(envelope.category);
    eventTypes.add(envelope.eventType);
    latestObservedAt = maxIsoDate(latestObservedAt, envelope.observedAt);

    const group = grouped.get(envelope.eventType);
    if (group === undefined) {
      grouped.set(envelope.eventType, { category: envelope.category, refs: [ref] });
    } else {
      group.refs.push(ref);
    }
  });

  if (evidenceRefs.length === 0) {
    const emptyCard = createEmptyTrustCardV1({
      subject: input.subject,
      generatedAt: context.now,
      caveats: warnings.map((warning) => warning.message),
    });
    return { card: emptyCard, consumedEvidenceHashes, warnings };
  }

  const signals = [...grouped.entries()].map(([eventType, group]) => {
    const registryEntry = context.lexicon?.get(eventType);
    return {
      label: registryEntry?.title ?? labelFromEventType(eventType),
      stance: stanceForEventType(eventType, group.category),
      confidence: Math.min(0.95, 0.55 + group.refs.length * 0.1),
      description: `${group.refs.length} publishable ${group.category} evidence reference${group.refs.length === 1 ? '' : 's'} reduced without raw payload content.`,
      evidenceRefs: group.refs,
    };
  });

  const caveats = [
    'Signals are compact projections over published evidence, not final reputation scores.',
    ...warnings.map((warning) => warning.message),
  ];
  const card = TrustCardV1Schema.parse({
    version: 'trust-card/v1',
    subject: input.subject,
    generatedAt: context.now,
    headline: `${evidenceRefs.length} publishable evidence reference${evidenceRefs.length === 1 ? '' : 's'} available`,
    summary: {
      compact: `Reduced ${evidenceRefs.length} privacy-safe evidence envelope${evidenceRefs.length === 1 ? '' : 's'} across ${eventTypes.size} event type${eventTypes.size === 1 ? '' : 's'}.`,
      caveats,
    },
    signals,
    evidenceSummary: {
      evidenceCount: evidenceRefs.length,
      categories: [...categories].sort(),
      eventTypes: [...eventTypes].sort(),
      ...(latestObservedAt !== undefined ? { latestObservedAt } : {}),
    },
    drillDown: { evidenceRefs },
  });

  return { card, consumedEvidenceHashes, warnings };
};

const prepareBundle = (
  input: PublishEvidenceBundleInput,
  defaults: PublisherValidationOptions,
): PreparedBundle => {
  const bundle = resolveBundle(input);
  const registry = input.registry ?? defaults.registry;
  const requireRegisteredEventTypes =
    input.requireRegisteredEventTypes ?? defaults.requireRegisteredEventTypes;
  validateBundleForPublishing(bundle, {
    ...(registry !== undefined ? { registry } : {}),
    ...(requireRegisteredEventTypes !== undefined ? { requireRegisteredEventTypes } : {}),
  });
  const canonicalJson = canonicalizeEvidenceBundleV1(bundle);
  const digest = hashEvidenceBundleV1(bundle);
  return {
    bundle,
    canonicalJson,
    digest,
    byteLength: Buffer.byteLength(canonicalJson, 'utf8'),
  };
};

const resolveBundle = (input: PublishEvidenceBundleInput): EvidenceBundleV1 => {
  if (input.bundle !== undefined) {
    return EvidenceBundleV1Schema.parse(input.bundle);
  }

  if (input.envelopes === undefined || input.createdAt === undefined) {
    throw new Error('Publishers require either bundle or envelopes with createdAt');
  }

  return createEvidenceBundleV1({
    envelopes: input.envelopes,
    createdAt: input.createdAt,
    ...(input.name !== undefined ? { name: input.name } : {}),
  });
};

const validateBundleForPublishing = (
  bundle: EvidenceBundleV1,
  options: PublisherValidationOptions,
): void => {
  const requireRegisteredEventTypes =
    options.requireRegisteredEventTypes ?? options.registry !== undefined;

  for (const envelope of bundle.envelopes) {
    const parsed = TrustEvidenceEnvelopeV1Schema.parse(envelope);
    if (parsed.privacy.publishable !== true) {
      throw new Error(`Envelope is not publishable: ${parsed.eventType}`);
    }

    const registryEntry = options.registry?.get(parsed.eventType);
    if (requireRegisteredEventTypes && registryEntry === undefined) {
      throw new Error(`Envelope event type is not registered: ${parsed.eventType}`);
    }

    if (registryEntry !== undefined) {
      if (registryEntry.category !== parsed.category) {
        throw new Error(`Envelope category does not match lexicon entry for ${parsed.eventType}`);
      }
      if (!registryEntry.privacy.allowedRedactionLevels.includes(parsed.privacy.redaction)) {
        throw new Error(`Envelope redaction level is not allowed for ${parsed.eventType}`);
      }
    }
  }
};

const parseEvidenceBundleV1 = (value: unknown): EvidenceBundleV1 => {
  const record = requireRecord(value, 'Evidence bundle');
  assertOnlyKeys(record, ['version', 'createdAt', 'name', 'envelopes'], 'Evidence bundle');
  if (record.version !== 'trust-evidence-bundle/v1') {
    throw new Error('Evidence bundle version must be trust-evidence-bundle/v1');
  }
  if (typeof record.createdAt !== 'string' || Number.isNaN(Date.parse(record.createdAt))) {
    throw new Error('Evidence bundle createdAt must be an ISO datetime string');
  }
  if (record.name !== undefined && (typeof record.name !== 'string' || record.name.length === 0)) {
    throw new Error('Evidence bundle name must be a non-empty string when provided');
  }
  if (!Array.isArray(record.envelopes)) {
    throw new Error('Evidence bundle envelopes must be an array');
  }

  const envelopes = record.envelopes.map((envelope) =>
    TrustEvidenceEnvelopeV1Schema.parse(envelope),
  );
  return {
    version: 'trust-evidence-bundle/v1',
    createdAt: record.createdAt,
    ...(record.name !== undefined ? { name: record.name } : {}),
    envelopes,
  };
};

const parseEvidenceSignatureV1 = (value: unknown): EvidenceSignatureV1 => {
  const record = requireRecord(value, 'Evidence signature');
  assertOnlyKeys(
    record,
    ['schemaVersion', 'algorithm', 'signedHash', 'publicKeyPem', 'signatureBase64'],
    'Evidence signature',
  );
  if (record.schemaVersion !== 'trust-evidence-signature/v1') {
    throw new Error('Evidence signature schemaVersion must be trust-evidence-signature/v1');
  }
  if (record.algorithm !== 'ed25519') {
    throw new Error('Evidence signature algorithm must be ed25519');
  }
  if (!isKeccakHash(record.signedHash)) {
    throw new Error('Evidence signature signedHash must be a 32-byte 0x hash');
  }
  if (
    typeof record.publicKeyPem !== 'string' ||
    !record.publicKeyPem.includes('BEGIN PUBLIC KEY')
  ) {
    throw new Error('Evidence signature publicKeyPem must be a PEM public key');
  }
  if (typeof record.signatureBase64 !== 'string' || record.signatureBase64.length === 0) {
    throw new Error('Evidence signature signatureBase64 must be non-empty');
  }

  return {
    schemaVersion: 'trust-evidence-signature/v1',
    algorithm: 'ed25519',
    signedHash: record.signedHash,
    publicKeyPem: record.publicKeyPem,
    signatureBase64: record.signatureBase64,
  };
};

const requireRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const isKeccakHash = (value: unknown): value is `0x${string}` =>
  typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);

const assertOnlyKeys = (
  record: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string,
): void => {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      throw new Error(`${label} contains unknown key: ${key}`);
    }
  }
};

const readLighthouseCid = (data: unknown): string => {
  const record = requireRecord(data, 'Lighthouse upload response data');
  if (typeof record.Hash !== 'string' || record.Hash.length === 0) {
    throw new Error('Lighthouse upload response did not include data.Hash');
  }
  return record.Hash;
};

const safeFileStem = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized.length === 0 ? 'trust-evidence' : normalized.slice(0, 80);
};

const hexToBytes = (value: `0x${string}`): Uint8Array => Buffer.from(value.slice(2), 'hex');

const sameIdentity = (left: TrustAgentIdentityV1, right: TrustAgentIdentityV1): boolean =>
  canonicalizeJson(left) === canonicalizeJson(right);

const labelFromEventType = (eventType: string): string =>
  eventType
    .split(/[.-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const stanceForEventType = (
  eventType: string,
  category: EvidenceEventCategory,
): TrustCardV1['signals'][number]['stance'] => {
  if (eventType.includes('defection')) {
    return 'negative';
  }
  if (eventType.includes('cooperation') || eventType.includes('completed')) {
    return 'positive';
  }
  if (category === 'capability' || category === 'outcome') {
    return 'positive';
  }
  if (category === 'attestation') {
    return 'informational';
  }
  return 'unknown';
};

const truncate = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;

const maxIsoDate = (left: string | undefined, right: string): string => {
  if (left === undefined) {
    return right;
  }
  return Date.parse(right) > Date.parse(left) ? right : left;
};

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

export type { JsonObject };
