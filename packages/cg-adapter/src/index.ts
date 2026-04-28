import {
  type JsonObject,
  type TrustAgentIdentityV1,
  type TrustCardV1,
  TrustCardV1Schema,
  type TrustEvidenceEnvelopeV1,
  TrustEvidenceEnvelopeV1Schema,
  type TrustEvidenceRef,
  type TrustSignalV1,
  createCoordinationGameIdentity,
  defaultPublishSafetyPolicy,
  hashTrustEvidenceEnvelopeV1,
} from '@agentic-trust/core';

export type CoordinationGameTrustSignalStance =
  | 'positive'
  | 'negative'
  | 'informational'
  | 'unknown';

export interface CoordinationGameTrustEvidenceRefV1 {
  readonly kind: string;
  readonly id: string;
  readonly visibility: 'public' | 'viewer-visible';
  readonly round?: number;
  readonly relayIndex?: number;
  readonly summary?: string;
}

export interface CoordinationGameTrustSignalV1 {
  readonly label: string;
  readonly stance: CoordinationGameTrustSignalStance;
  readonly summary: string;
  readonly confidence?: number;
  readonly evidenceRefs?: readonly CoordinationGameTrustEvidenceRefV1[];
}

export interface CoordinationGameTrustCardV1 {
  readonly schemaVersion: 'trust-card/v1';
  readonly agentId: string;
  readonly subjectId: string;
  readonly headline: string;
  readonly summary: string;
  readonly signals: readonly CoordinationGameTrustSignalV1[];
  readonly caveats: readonly string[];
  readonly evidenceRefs: readonly CoordinationGameTrustEvidenceRefV1[];
  readonly updatedAt?: number;
}

export interface CoordinationGameAgentIdentityInput {
  readonly gameId: string;
  readonly playerId: string;
  readonly displayName?: string;
  readonly namespace?: string;
}

export interface VisibleTragedyPlayerSnapshot {
  readonly playerId: string;
  readonly displayName?: string;
  readonly influence?: number;
  readonly victoryPoints?: number;
  readonly totalResources?: number;
  readonly regionsControlled?: number;
  readonly lastAction?: string;
}

export interface CreateTragedyVisibleTrustInput {
  readonly gameId: string;
  readonly gameType?: string;
  readonly round?: number;
  readonly phase?: string;
  readonly progressCounter?: number;
  readonly observedAt: string;
  readonly createdAt?: string;
  readonly subject: VisibleTragedyPlayerSnapshot;
  readonly issuer?: TrustAgentIdentityV1;
  readonly namespace?: string;
}

export interface CreateTragedyVisibleTrustResult {
  readonly subject: TrustAgentIdentityV1;
  readonly issuer: TrustAgentIdentityV1;
  readonly envelope: TrustEvidenceEnvelopeV1;
  readonly envelopeHash: `0x${string}`;
  readonly card: TrustCardV1;
  readonly coordinationGameCard: CoordinationGameTrustCardV1;
}

const DEFAULT_NAMESPACE = 'coordination-games';
const TRAGEDY_EVENT_TYPE = 'tragedy.turn.outcome';
const TRAGEDY_CATEGORY = 'outcome';

export const createCoordinationGameAgentIdentity = (
  input: CoordinationGameAgentIdentityInput,
): TrustAgentIdentityV1 =>
  createCoordinationGameIdentity({
    alias: input.playerId,
    gameId: input.gameId,
    namespace: input.namespace ?? DEFAULT_NAMESPACE,
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
  });

export const createCoordinationGameEngineIdentity = (input: {
  readonly gameId: string;
  readonly gameType?: string;
  readonly namespace?: string;
}): TrustAgentIdentityV1 =>
  createCoordinationGameIdentity({
    alias: `engine:${input.gameType ?? 'game'}`,
    gameId: input.gameId,
    namespace: input.namespace ?? DEFAULT_NAMESPACE,
    displayName: 'Coordination Games engine',
  });

export function createTragedyVisibleTrust(
  input: CreateTragedyVisibleTrustInput,
): CreateTragedyVisibleTrustResult {
  const subject = createCoordinationGameAgentIdentity({
    gameId: input.gameId,
    playerId: input.subject.playerId,
    ...(input.namespace !== undefined ? { namespace: input.namespace } : {}),
    ...(input.subject.displayName !== undefined ? { displayName: input.subject.displayName } : {}),
  });
  const issuer =
    input.issuer ??
    createCoordinationGameEngineIdentity({
      gameId: input.gameId,
      gameType: input.gameType ?? 'tragedy-of-the-commons',
      ...(input.namespace !== undefined ? { namespace: input.namespace } : {}),
    });
  const createdAt = input.createdAt ?? input.observedAt;
  const summary = visibleTragedySummary(input.subject, input.round, input.phase);
  const payload = visibleTragedyPayload(input);
  const envelope = TrustEvidenceEnvelopeV1Schema.parse({
    version: 'trust-evidence/v1',
    eventType: TRAGEDY_EVENT_TYPE,
    category: TRAGEDY_CATEGORY,
    subject,
    issuer,
    observedAt: input.observedAt,
    createdAt,
    summary,
    payload,
    evidenceRefs: [],
    privacy: defaultPublishSafetyPolicy('aggregated'),
  });
  const envelopeHash = hashTrustEvidenceEnvelopeV1(envelope);
  const evidenceRef = createTrustEvidenceRef(envelope, envelopeHash, summary);
  const card = TrustCardV1Schema.parse({
    version: 'trust-card/v1',
    subject,
    generatedAt: createdAt,
    headline: 'Viewer-visible trust context',
    summary: {
      compact: summary,
      caveats: defaultCaveats(),
    },
    signals: createVisibleTragedySignals(input.subject, evidenceRef),
    evidenceSummary: {
      evidenceCount: 1,
      categories: [TRAGEDY_CATEGORY],
      eventTypes: [TRAGEDY_EVENT_TYPE],
      latestObservedAt: input.observedAt,
    },
    drillDown: {
      evidenceRefs: [evidenceRef],
    },
  });

  return {
    subject,
    issuer,
    envelope,
    envelopeHash,
    card,
    coordinationGameCard: toCoordinationGameTrustCard(card, {
      gameId: input.gameId,
      visibility: 'viewer-visible',
      ...(input.round !== undefined ? { round: input.round } : {}),
    }),
  };
}

export const createTragedyVisibleTrustCards = (
  inputs: readonly CreateTragedyVisibleTrustInput[],
): readonly CoordinationGameTrustCardV1[] =>
  inputs.map((input) => createTragedyVisibleTrust(input).coordinationGameCard);

export const toCoordinationGameTrustCard = (
  card: TrustCardV1,
  options: {
    readonly gameId?: string;
    readonly round?: number;
    readonly visibility?: CoordinationGameTrustEvidenceRefV1['visibility'];
  } = {},
): CoordinationGameTrustCardV1 => {
  const parsed = TrustCardV1Schema.parse(card);
  const evidenceRefs = parsed.drillDown.evidenceRefs.map((ref) =>
    toCoordinationGameEvidenceRef(ref, options),
  );
  return {
    schemaVersion: 'trust-card/v1',
    agentId: parsed.subject.coordinationGameAlias?.alias ?? parsed.subject.id,
    subjectId: parsed.subject.id,
    headline: parsed.headline,
    summary: parsed.summary.compact,
    signals: parsed.signals.map((signal) => ({
      label: signal.label,
      stance: toCoordinationGameStance(signal.stance),
      summary: signal.description ?? signal.label,
      ...(signal.confidence !== undefined ? { confidence: signal.confidence } : {}),
      evidenceRefs: signal.evidenceRefs.map((ref) => toCoordinationGameEvidenceRef(ref, options)),
    })),
    caveats: parsed.summary.caveats,
    evidenceRefs,
    updatedAt: Date.parse(parsed.generatedAt),
  };
};

const createTrustEvidenceRef = (
  envelope: TrustEvidenceEnvelopeV1,
  envelopeHash: `0x${string}`,
  summary: string,
): TrustEvidenceRef => ({
  envelopeHash,
  eventType: envelope.eventType,
  category: envelope.category,
  observedAt: envelope.observedAt,
  summary,
});

const toCoordinationGameEvidenceRef = (
  ref: TrustEvidenceRef,
  options: {
    readonly gameId?: string;
    readonly round?: number;
    readonly visibility?: CoordinationGameTrustEvidenceRefV1['visibility'];
  },
): CoordinationGameTrustEvidenceRefV1 => ({
  kind: ref.eventType,
  id: ref.envelopeHash ?? ref.envelopeId ?? `${options.gameId ?? 'game'}:${ref.eventType}`,
  visibility: options.visibility ?? 'viewer-visible',
  ...(options.round !== undefined ? { round: options.round } : {}),
  ...(ref.summary !== undefined ? { summary: ref.summary } : {}),
});

const toCoordinationGameStance = (
  stance: TrustSignalV1['stance'],
): CoordinationGameTrustSignalStance => {
  if (stance === 'mixed') return 'informational';
  return stance;
};

const createVisibleTragedySignals = (
  player: VisibleTragedyPlayerSnapshot,
  evidenceRef: TrustEvidenceRef,
): readonly TrustSignalV1[] => {
  const signals: TrustSignalV1[] = [];

  if (player.influence !== undefined || player.victoryPoints !== undefined) {
    signals.push({
      label: 'Visible table position',
      stance: 'informational',
      confidence: 0.72,
      description: `Visible score markers: ${metric('influence', player.influence)}, ${metric(
        'VP',
        player.victoryPoints,
      )}.`,
      evidenceRefs: [evidenceRef],
    });
  }

  if (player.totalResources !== undefined || player.regionsControlled !== undefined) {
    signals.push({
      label: 'Resource pressure context',
      stance: 'informational',
      confidence: 0.68,
      description: `Visible resources: ${metric('resources', player.totalResources)}, ${metric(
        'regions',
        player.regionsControlled,
      )}.`,
      evidenceRefs: [evidenceRef],
    });
  }

  if (player.lastAction !== undefined) {
    signals.push({
      label: 'Latest visible action',
      stance: actionStance(player.lastAction),
      confidence: 0.66,
      description: `Latest visible action: ${player.lastAction.replace(/_/g, ' ')}.`,
      evidenceRefs: [evidenceRef],
    });
  }

  if (signals.length === 0) {
    signals.push({
      label: 'Visible participation',
      stance: 'unknown',
      confidence: 0.4,
      description: 'The game exposed an agent slot, but no compact public signals yet.',
      evidenceRefs: [evidenceRef],
    });
  }

  return signals;
};

const actionStance = (action: string): TrustSignalV1['stance'] => {
  if (action.includes('extract')) return 'mixed';
  if (action.includes('build')) return 'positive';
  if (action.includes('trade')) return 'informational';
  return 'unknown';
};

const visibleTragedySummary = (
  player: VisibleTragedyPlayerSnapshot,
  round: number | undefined,
  phase: string | undefined,
): string => {
  const label = player.displayName ?? player.playerId;
  const roundText = round !== undefined ? `round ${round}` : 'the current round';
  const phaseText = phase !== undefined ? ` during ${phase}` : '';
  return `${label} has a viewer-visible Tragedy context for ${roundText}${phaseText}: ${metric(
    'influence',
    player.influence,
  )}, ${metric('VP', player.victoryPoints)}, ${metric('resources', player.totalResources)}.`;
};

const visibleTragedyPayload = (input: CreateTragedyVisibleTrustInput): JsonObject => {
  const payload: JsonObject = {
    gameId: input.gameId,
    gameType: input.gameType ?? 'tragedy-of-the-commons',
    subjectPlayerId: input.subject.playerId,
  };
  addOptional(payload, 'round', input.round);
  addOptional(payload, 'phase', input.phase);
  addOptional(payload, 'progressCounter', input.progressCounter);
  addOptional(payload, 'displayName', input.subject.displayName);
  addOptional(payload, 'influence', input.subject.influence);
  addOptional(payload, 'victoryPoints', input.subject.victoryPoints);
  addOptional(payload, 'totalResources', input.subject.totalResources);
  addOptional(payload, 'regionsControlled', input.subject.regionsControlled);
  addOptional(payload, 'lastAction', input.subject.lastAction);
  return payload;
};

const addOptional = (target: JsonObject, key: string, value: string | number | undefined): void => {
  if (value !== undefined) target[key] = value;
};

const metric = (label: string, value: number | undefined): string =>
  value === undefined || !Number.isFinite(value) ? `${label} unknown` : `${label} ${value}`;

const defaultCaveats = (): readonly string[] => [
  'Compact projection over viewer-visible game evidence; not a final reputation score.',
  'Does not include private DMs, hidden strategy, model reasoning, or full per-tick hidden state.',
];
