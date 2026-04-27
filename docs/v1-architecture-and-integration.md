# Agentic Trust Primitive v1: findings and integration plan

Status: v1 planning document. The TypeScript primitive exists, but the Coordination Games engine, game plugins, and reasoning-surface UI do not consume it yet.

## Simple framing

The current repository is the **Agentic Trust Primitive**: a small set of portable building blocks for evidence-first trust.

The broader vision is the **Agentic Trust Protocol**: a future ecosystem where agents, games, services, and storage networks can exchange signed, content-addressed trust evidence using shared lexicons.

In short:

```text
Agentic Trust Primitive = implementation building blocks
Agentic Trust Protocol  = the larger interoperability vision
```

## What v1 already has

- `@agentic-trust/core`
  - agent identity schemas
  - `TrustEvidenceEnvelopeV1`
  - privacy and publish-safety flags
  - canonical JSON and keccak256 hashing
  - lexicon entries and registry helpers
  - TrustCard schemas
  - reducer interfaces
- `@agentic-trust/publishers`
  - evidence bundle schema
  - deterministic bundle hashing
  - Ed25519 bundle signing and verification
  - `NoopPublisher`
  - `LocalFilePublisher`
  - `LighthousePublisher`
  - starter Tragedy and agent-work lexicon entries
  - basic evidence-to-TrustCard reducer
- `@agentic-trust/cg-adapter`
  - scaffold only today; this should become the Coordination Games integration layer.

## What v1 is not yet

The primitive is **not yet integrated into**:

- the Coordination Games engine
- game plugins such as Tragedy
- live match/event storage
- reasoning-surface UI
- agent prompts or tool surfaces
- lobby gating or conduct scoring

So today it is testable as a library, not as an in-game trust surface.

## Envelope model

A trust evidence envelope is a portable evidence record. It is not a score and not a whole reputation system.

Conceptually:

```text
TrustEvidenceEnvelopeV1
  subject       who the evidence is about
  issuer        who created/attested the evidence
  eventType     lexicon event name, e.g. tragedy.cooperation
  category      behavior / outcome / capability / attestation / policy
  summary       short publishable description
  payload       structured, privacy-safe event data
  evidenceRefs  hashes, URIs, CIDs, proofs, or external references
  privacy       publish-safety and redaction flags
```

The same envelope shape can represent three different trust roles:

1. **Game-issued receipts**
   - issuer: game engine or verifier
   - subject: an agent/player
   - example: “the game observed this agent cooperated on turn 3”
2. **Self-attestations**
   - issuer: the same agent as the subject
   - example: “I claim I completed this task”
3. **Peer or auditor attestations**
   - issuer: another agent, reviewer, or steward
   - subject: the agent being reviewed
   - example: “I reviewed this agent’s output and found it correct”

Trust comes from the issuer, signature, evidence references, lexicon, and reducer policy. The envelope only makes the evidence portable and verifiable.

## Lexicons: where they should live

The primitive should own generic lexicon mechanics:

- lexicon entry schema
- event type naming rules
- registry helpers
- privacy metadata
- versioning rules

Game-specific semantics should live near the game adapter or plugin:

```text
@agentic-trust/core
  generic lexicon registry and validation

@agentic-trust/cg-adapter
  Coordination Games shared event mappings

Tragedy plugin / adapter
  tragedy.cooperation
  tragedy.defection
  tragedy.turn.outcome
  tragedy.attestation
```

The current `publishers` package includes starter Tragedy lexicon entries only as a v1 convenience. A cleaner next step is moving game lexicons into `cg-adapter` or a dedicated game package.

## Publishers

Publishers validate and publish evidence bundles. They do not decide what is trustworthy.

```text
Evidence envelopes
  -> parse and privacy-check
  -> bundle
  -> canonical JSON
  -> keccak256 digest
  -> optional signature
  -> publish
```

Available publishers:

- `NoopPublisher`
  - validates and hashes only
  - returns `urn:agentic-trust:noop:<digest>`
  - useful for tests and dry runs
- `LocalFilePublisher`
  - writes canonical JSON evidence bundles to disk
  - useful for local demos and deterministic artifacts
- `LighthousePublisher`
  - uploads canonical JSON to Lighthouse/IPFS using `uploadText`
  - returns `ipfs://CID` and gateway metadata
  - API key is passed explicitly; the package does not read local secret files

## Visual: how the primitive fits the game

```text
┌───────────────────────┐
│ Agents / Players      │
│ wallet, ERC-8004 id,  │
│ handle, game alias    │
└───────────┬───────────┘
            │ joins / acts / reads trust
            ▼
┌───────────────────────┐
│ Coordination Game     │
│ Engine                │
│ match, turns, replay, │
│ structured outcomes   │
└───────────┬───────────┘
            │ emits structured events
            ▼
┌───────────────────────┐
│ Game Plugin           │
│ e.g. Tragedy          │
│ cooperation, defection│
│ turn outcomes         │
└───────────┬───────────┘
            │ maps game events to lexicon records
            ▼
┌───────────────────────┐
│ @agentic-trust/       │
│ cg-adapter            │
│ game event -> envelope│
│ game lexicons         │
└───────────┬───────────┘
            │ creates TrustEvidenceEnvelopeV1
            ▼
┌───────────────────────┐
│ Agentic Trust         │
│ Primitive             │
│ validate, canonicalize│
│ hash, sign, bundle    │
└───────────┬───────────┘
            │ publishes / reduces
            ▼
┌───────────────────────┐       ┌───────────────────────┐
│ Publishers            │       │ Reducers / TrustCards  │
│ local file, IPFS,     │       │ compact agent-facing   │
│ future AT Proto/root  │       │ evidence summaries     │
└───────────┬───────────┘       └───────────┬───────────┘
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ Evidence Store        │       │ Reasoning Surface UI  │
│ file/IPFS/ATProto/    │       │ agent trust panel,    │
│ Merkle roots          │       │ evidence drill-down   │
└───────────────────────┘       └───────────────────────┘
```

## Initial game-engine adoption path

The first integration should be consumption-first and evidence-first, not conduct-score-first.

### Phase 1: identity binding

Map each game participant to a stable trust identity:

```text
wallet address
  -> ERC-8004 agent id, when available
  -> game player id / handle
  -> TrustAgentIdentityV1
```

The game should not invent a new identity if wallet or ERC-8004 identity already exists.

### Phase 2: game event to envelope

Add adapter functions in `@agentic-trust/cg-adapter`:

```ts
fromTragedyTurnOutcome(event) -> TrustEvidenceEnvelopeV1
fromGameCompletion(event) -> TrustEvidenceEnvelopeV1
fromAgentAttestation(event) -> TrustEvidenceEnvelopeV1
```

The Tragedy plugin should emit only publishable, redacted, bounded fields. It must not emit raw private chats, hidden strategies, full per-tick state, or unredacted private commitments.

### Phase 3: local publishing

For local demos, write evidence bundles to a deterministic local directory:

```text
.agentic-trust/evidence/<gameId>/<bundleHash>.json
```

This makes the primitive visible without requiring Lighthouse/IPFS or an on-chain transaction.

### Phase 4: TrustCard consumption

Agents and UI consume compact TrustCards first:

```text
agent sees:
  - headline
  - compact summary
  - signals
  - caveats
  - bounded evidence refs

agent does not see:
  - raw private chat
  - hidden strategy
  - full per-tick state
```

### Phase 5: optional publishing backends

Once local flow works:

- Lighthouse/IPFS publisher for content-addressed public evidence bundles
- EIP-712 signature adapter for wallet-native attestations
- Merkle/session-root publisher for compact game proofs
- AT Protocol publisher for DID/PDS-hosted public trust records

## Compatibility with Lucian's trust-attestations plan

Lucian's plan is best understood as a higher-level Coordination Games reputation plugin, not as a replacement for the primitive.

Lucian plan:

- wallet-canonical identity
- EIP-712/EAS-style attestations
- `conduct` and `skill:<game>` scopes
- polarity and size
- stewardship
- activity-based decay
- slot capacity
- lobby gating
- daily Merkle rollups

Primitive:

- evidence envelope
- lexicons
- canonical hashes
- signatures
- publishers
- TrustCards
- reducer interfaces

Compatibility mapping:

```text
Lucian attester_wallet   -> envelope.issuer
Lucian subject_wallet    -> envelope.subject
Lucian scope             -> eventType / lexicon namespace
Lucian polarity + size   -> reducer/scoring-layer fields
Lucian reason            -> summary / payload / evidenceRefs
Lucian EIP-712 signature -> future EIP-712 signature adapter
Lucian Merkle root       -> future root publisher
Lucian score endpoint    -> reducer output / TrustCard / score API
```

We do not need to build the conduct model for v1. If desired later, it should be implemented as a Coordination Games reducer/plugin on top of evidence envelopes.

## Signature strategy

EIP-712 and Ed25519 are compatible at the protocol-design level if signatures are modeled abstractly. They are not interchangeable cryptographic formats.

Recommended split:

```text
EIP-712
  wallet-native attestations
  ERC-8004 / Ethereum compatibility
  game/player-signed claims

Ed25519
  portable agent/service/verifier receipts
  local/offline agents
  non-EVM deployments
```

Future signature abstraction:

```ts
type TrustSignature =
  | { algorithm: 'ed25519'; signer: TrustAgentIdentityV1; signedHash: string; signatureBase64: string }
  | { algorithm: 'eip712'; signer: TrustAgentIdentityV1; domain: object; types: object; value: object; signature: string };
```

## AT Protocol findings

AT Protocol is promising as an optional off-chain publisher/storage backend, not as a replacement for the primitive.

Established AT Protocol capabilities:

- DIDs, especially `did:plc`
- custom lexicons with NSIDs
- Personal Data Servers (PDS)
- public account repositories
- Merkle Search Tree storage
- signed repository commits
- record sync/firehose

Important constraint:

- AT Protocol uses ECDSA P-256 or secp256k1/K-256 for repository commits, not Ed25519.
- It signs repository commits, not individual trust envelopes.

Clean layering:

```text
TrustEvidenceEnvelope
  signed by Ed25519 or EIP-712
  stored as an AT Protocol record
  included in a signed AT Protocol repo commit
  synced through PDS/firehose
```

AT Protocol would be useful for:

- publishing trust envelopes as records
- publishing TrustCards as records
- game-specific trust lexicons
- agent-owned public trust logs
- decentralized syncing/indexing

Agentic AT Protocol usage is early but real. Examples found include active non-social/custom-lexicon projects such as `molt-atproto` and `ghost-atproto`, plus more speculative agent-focused work such as BlueClaw.

## DDoS and attack-surface notes

The primitive should provide guardrails, not full reputation-defense policy.

Primitive-level guardrails:

- strict schemas
- canonical hashes
- signature verification
- payload size limits in future
- publish-safety flags
- lexicon allowlists
- issuer identity fields
- content-addressed dedupe

Higher-layer defenses:

- issuer allowlists
- rate limits and quotas
- game-verifier roots
- reducer policies
- score decay
- slot capacity
- stewardship or issuer reputation
- bounded TrustCard drill-downs

Scale model:

```text
many envelopes
  -> hash and dedupe
  -> bundle or Merkle root
  -> publish once
  -> consume compact TrustCards
  -> drill down only by bounded evidence refs
```

## v1 decisions

1. Keep the repo/package framed as **Agentic Trust Primitive**.
2. Use **Agentic Trust Protocol** for the broader future spec and ecosystem.
3. Keep conduct scoring, decay, recovery, slot capacity, and lobby gating out of the primitive.
4. Keep game-specific lexicons close to the game adapter/plugin in the next wave.
5. Add EIP-712 support as a future signature adapter, not as a replacement for Ed25519.
6. Treat AT Protocol as a future publisher/sync backend.
7. Integrate locally first: game event -> envelope -> local file publisher -> TrustCard -> reasoning-surface display.

## Open work for later

- Move starter Tragedy lexicons from `publishers` into `cg-adapter` or a dedicated game lexicon module.
- Implement `cg-adapter` event-to-envelope helpers.
- Add a local demo script that writes a Tragedy envelope bundle and TrustCard JSON.
- Add EIP-712 signature support for wallet/ERC-8004 attestations.
- Add Merkle/session-root support for game evidence sets.
- Add an AT Protocol publisher package or adapter.
- Add explicit payload byte-size limits.
- Add issuer allowlist/rate-limit hooks around publishers.
- Integrate TrustCard consumption into the reasoning-surface demo UI.
- Let agents consume TrustCards/evidence refs in prompts before they create attestations themselves.
