import { describe, expect, it } from 'vitest';

import { TrustCardV1Schema, TrustEvidenceEnvelopeV1Schema } from '@agentic-trust/core';

import {
  createCoordinationGameAgentIdentity,
  createTragedyVisibleTrust,
  toCoordinationGameTrustCard,
} from './index.js';

describe('coordination-games adapter', () => {
  it('creates primitive evidence and a stable demo wire card from visible Tragedy state', () => {
    const result = createTragedyVisibleTrust({
      gameId: 'game-1',
      round: 3,
      phase: 'playing',
      progressCounter: 12,
      observedAt: '2026-04-28T12:00:00.000Z',
      subject: {
        playerId: 'alice',
        displayName: 'Alicia Commons',
        influence: 2,
        victoryPoints: 4,
        totalResources: 7,
        regionsControlled: 2,
        lastAction: 'build_settlement',
      },
    });

    expect(TrustEvidenceEnvelopeV1Schema.parse(result.envelope)).toEqual(result.envelope);
    expect(TrustCardV1Schema.parse(result.card)).toEqual(result.card);
    expect(result.envelopeHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(result.envelope.privacy.containsPrivateChat).toBe(false);
    expect(result.card.subject.id).toContain('alice');

    expect(result.coordinationGameCard).toMatchObject({
      schemaVersion: 'trust-card/v1',
      agentId: 'alice',
      headline: 'Viewer-visible trust context',
    });
    expect(result.coordinationGameCard.summary).toContain('Alicia Commons');
    expect(result.coordinationGameCard.signals.map((signal) => signal.label)).toEqual([
      'Visible table position',
      'Resource pressure context',
      'Latest visible action',
    ]);
    expect(result.coordinationGameCard.evidenceRefs[0]?.visibility).toBe('viewer-visible');
    expect(result.coordinationGameCard.caveats.join(' ')).toContain('Does not include private DMs');
  });

  it('flattens primitive TrustCards without changing the demo UI contract', () => {
    const subject = createCoordinationGameAgentIdentity({
      gameId: 'game-2',
      playerId: 'bob',
      displayName: 'Bob Timber',
    });
    const primitiveCard = TrustCardV1Schema.parse({
      version: 'trust-card/v1',
      subject,
      generatedAt: '2026-04-28T12:01:00.000Z',
      headline: 'Evidence available',
      summary: {
        compact: 'Bob has one public evidence record.',
        caveats: ['Compact only.'],
      },
      signals: [
        {
          label: 'Mixed signal',
          stance: 'mixed',
          confidence: 0.5,
          description: 'Primitive mixed stance maps to informational for the demo wire shape.',
          evidenceRefs: [
            {
              envelopeId: 'draft-1',
              eventType: 'tragedy.turn.outcome',
              category: 'outcome',
              observedAt: '2026-04-28T12:00:00.000Z',
              summary: 'Draft evidence.',
            },
          ],
        },
      ],
      evidenceSummary: {
        evidenceCount: 1,
        categories: ['outcome'],
        eventTypes: ['tragedy.turn.outcome'],
        latestObservedAt: '2026-04-28T12:00:00.000Z',
      },
      drillDown: {
        evidenceRefs: [
          {
            envelopeId: 'draft-1',
            eventType: 'tragedy.turn.outcome',
            category: 'outcome',
            observedAt: '2026-04-28T12:00:00.000Z',
            summary: 'Draft evidence.',
          },
        ],
      },
    });

    const wireCard = toCoordinationGameTrustCard(primitiveCard, {
      gameId: 'game-2',
      round: 4,
    });

    expect(wireCard.schemaVersion).toBe('trust-card/v1');
    expect(wireCard.agentId).toBe('bob');
    expect(wireCard.summary).toBe('Bob has one public evidence record.');
    expect(wireCard.signals[0]?.stance).toBe('informational');
    expect(wireCard.signals[0]?.summary).toContain('Primitive mixed stance');
    expect(wireCard.evidenceRefs[0]).toMatchObject({
      id: 'draft-1',
      kind: 'tragedy.turn.outcome',
      round: 4,
      visibility: 'viewer-visible',
    });
  });
});
