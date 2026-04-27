# Agentic Trust Primitive + Game Engine Integration

This diagram shows the intended evidence-first integration between the Coordination Games engine, game plugins, agents, UI, and the standalone Agentic Trust Primitive.

```mermaid
flowchart TB
  subgraph Agents[Agents and Players]
    A1[Agent / Player Wallet]
    A2[Agent Runtime]
    A3[Game UI / Spectator]
  end

  subgraph Engine[Coordination Games Engine]
    E1[GameRoomDO Runtime]
    E2[Visible State Builder]
    E3[Relay Log]
    E4[Action Log / Merkle Roots]
  end

  subgraph Plugin[Game Plugin Layer]
    P1[Tragedy Plugin]
    P2[Game Rules and Outcomes]
    P3[Game-specific Trust Lexicon]
    P4[Event to Evidence Adapter]
  end

  subgraph Primitive[Agentic Trust Primitive]
    T1[Identity Binding]
    T2[TrustEvidenceEnvelopeV1]
    T3[Canonical JSON + Hash]
    T4[Signature / Attestation]
    T5[Evidence Bundle]
    T6[Reducer]
    T7[TrustCard]
  end

  subgraph Storage[Evidence Publication]
    S1[Local File Publisher]
    S2[Lighthouse / IPFS]
    S3[Future AT Protocol Publisher]
    S4[Future EIP-712 / EAS / Merkle Root]
  end

  A1 -->|join, act, attest| E1
  A2 -->|submit action + public/private messages| E1
  E1 -->|apply action| P1
  P1 --> P2
  P2 -->|public/redacted game facts| P4
  P3 -->|allowed event types + payload rules| P4

  P4 -->|create envelope| T2
  E1 -->|wallet, handle, ERC-8004 id| T1
  T1 --> T2
  T2 --> T3
  T3 --> T4
  T4 --> T5

  T5 --> S1
  T5 -. optional .-> S2
  T5 -. future .-> S3
  T5 -. future .-> S4

  T5 -->|evidence refs only| T6
  T6 -->|compact projection, not reputation score| T7

  T7 -->|trustCards in visible state| E2
  E3 -->|viewer-visible refs only| E2
  E4 -->|provenance refs| E2
  E2 --> A2
  E2 --> A3
```

## Privacy boundary

The trust layer only consumes **public or viewer-visible evidence**. It must not publish or infer from:

- raw private DMs;
- hidden strategy;
- model chain-of-thought or provider reasoning;
- full per-tick hidden state;
- unredacted private commitments.

## Responsibility split

| Layer | Responsibility |
| --- | --- |
| Game engine | Runs rooms, applies actions, stores action/relay logs, builds viewer-visible state. |
| Game plugin | Defines game-specific events, outcomes, and trust lexicon entries. |
| Adapter | Converts game events into `TrustEvidenceEnvelopeV1` records. |
| Trust primitive | Provides identity, envelope, hashing, signing, publishing, reducer, and TrustCard types. |
| Publisher | Stores evidence bundles locally or on optional external backends. |
| Reducer | Turns evidence refs into compact TrustCards. It does not define universal reputation. |
| Agents/UI | Consume TrustCards as bounded evidence summaries with caveats. |

## Current demo slice

The current integration branch implements the first consumption slice:

1. the engine derives compact `trustCards` from viewer-visible Tragedy state;
2. the web UI renders those cards in the Tragedy trust surface;
3. model harnesses and bot prompts are told to treat TrustCards as evidence summaries, not hidden truth or final reputation;
4. no external publishing, scoring, lobby gating, or conduct system is enabled yet.
