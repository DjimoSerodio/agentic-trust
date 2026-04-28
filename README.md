# Agentic Trust Primitive

`agentic-trust` is an evidence-first portable trust primitive for agents. It is designed to make trust claims reproducible across runtimes by hashing evidence, publishing proofs to local files or IPFS, and anchoring attestations against stable agent identity.

This repository is the standalone primitive tooling that can evolve independently, and can be consumed through adapters.

Use **Agentic Trust Primitive** for this TypeScript implementation. Use **Agentic Trust Protocol** for the broader future interoperability spec.

## Packages

```text
packages/
  core/         Types, hashing, lexicon, and reducer interfaces.
  publishers/   Local file, noop, and Lighthouse publisher implementations.
  cg-adapter/   Coordination Games integration surface.
```

## Implementation Phases

1. Scaffold the pnpm workspace, strict TypeScript, Vitest, and Biome.
2. Add core trust types, canonical hashing, lexicon entries, and reducer contracts.
3. Implement evidence bundles, serialization rules, and local validation utilities.
4. Add publisher implementations for noop, local file, and Lighthouse/IPFS.
5. Wire the adapters to translate evidence into trust records.
6. Add ERC-8004 anchoring, end-to-end examples, and release packaging.

## Architecture Notes

## Development

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm exec biome check .
```
