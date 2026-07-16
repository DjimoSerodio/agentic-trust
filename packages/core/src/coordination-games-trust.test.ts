import { describe, expect, it } from 'vitest';
import {
  createInMemoryEasGateway,
  createInMemoryPromiseOutcomeAnchorStore,
  createPromiseOutcomeAnchor,
  createWalletBindingRecord,
  verifyWalletBindingRecord,
} from './index.js';

const event = {
  eventVersion: 'promise-outcome/v1',
  schemaVersion: 'trust-schema/v1',
  algorithmVersion: 'reliability/v1',
  actorDid: 'did:plc:z72i7hdynmk6r22z27h6tvur',
  subjectDid: 'did:plc:abcdefghijklmnopqrstuvwx',
  outcome: 'kept',
  gameId: 'tragedy:extracted-boundary',
  sequence: 1,
  evidence: {
    uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/trust.event/1',
    cid: 'bafybeigdyrzt6ic3b7q4tf6h3y2x4cn27lu5ps5h7izngyztby6cd3k6da',
  },
  observedAt: '2026-07-16T12:00:00.000Z',
} as const;

describe('Coordination Games trust compatibility', () => {
  it('preserves durable EAS idempotency across reconstructed anchors', async () => {
    // Given a gateway and an injected store shared by reconstructed anchors
    const gateway = createInMemoryEasGateway({
      chainId: 11155420,
      easContract: '0x4200000000000000000000000000000000000021',
      schemaUid: '0x16d2be53c55b4fd4d608144892ebeb1102b181ad099c06dc7536d3517dd5ba99',
      attester: '0x14791697260E4c9A71f18484C9f997B308e59325',
    });
    const store = createInMemoryPromiseOutcomeAnchorStore();

    // When separate anchors receive the same public event
    const first = await createPromiseOutcomeAnchor(gateway, store).anchor(
      event,
      '2026-07-16T12:01:00.000Z',
    );
    const duplicate = await createPromiseOutcomeAnchor(gateway, store).anchor(
      event,
      '2026-07-16T12:02:00.000Z',
    );

    // Then the durable first record is returned without semantic drift
    expect(duplicate).toEqual(first);
  });

  it('exposes the SIWE binding constructors at the standalone public boundary', () => {
    // Given the package public API
    // When a consumer resolves its exported construction and verification functions
    // Then it receives callable trust boundary primitives
    expect(createWalletBindingRecord).toBeTypeOf('function');
    expect(verifyWalletBindingRecord).toBeTypeOf('function');
  });
});
