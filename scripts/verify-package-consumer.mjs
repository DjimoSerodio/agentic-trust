import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'agentic-trust-package-consumer-'));

try {
  const packageOutput = execFileSync(
    'npm',
    ['pack', '--json', '--pack-destination', temporaryDirectory],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  const [packed] = JSON.parse(packageOutput);
  if (typeof packed?.filename !== 'string' || !Array.isArray(packed.files)) {
    throw new Error('npm pack did not report a package file list');
  }
  const packedFiles = packed.files.map((file) => file.path);
  if (packedFiles.some((file) => file.includes('.test.'))) {
    throw new Error(`Packed test artifact: ${packedFiles.find((file) => file.includes('.test.'))}`);
  }
  if (
    !packedFiles.includes('packages/core/dist/index.js') ||
    !packedFiles.includes('packages/core/dist/index.d.ts')
  ) {
    throw new Error('Packed package is missing its public runtime or declaration entrypoint');
  }

  const consumerManifest = {
    name: 'agentic-trust-package-consumer',
    private: true,
    type: 'module',
    dependencies: { '@agentic-trust/trust': `file:${join(temporaryDirectory, packed.filename)}` },
  };
  writeFileSync(
    join(temporaryDirectory, 'package.json'),
    `${JSON.stringify(consumerManifest)}\n`,
    'utf8',
  );
  execFileSync('npm', ['install', '--ignore-scripts'], {
    cwd: temporaryDirectory,
    encoding: 'utf8',
    env: { ...process.env, GIT_SSH_COMMAND: 'false' },
  });

  writeFileSync(
    join(temporaryDirectory, 'consumer.mjs'),
    `import { createPromiseOutcomeAttestation, createWalletBindingRecord } from '@agentic-trust/trust';
if (typeof createWalletBindingRecord !== 'function') throw new Error('Public package is missing the SIWE constructor');
const attestation = createPromiseOutcomeAttestation({ eventVersion: 'promise-outcome/v1', schemaVersion: 'trust-schema/v1', algorithmVersion: 'reliability/v1', actorDid: 'did:plc:z72i7hdynmk6r22z27h6tvur', subjectDid: 'did:plc:abcdefghijklmnopqrstuvwx', outcome: 'kept', gameId: 'package-consumer', sequence: 1, evidence: { uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/trust.event/1', cid: 'bafybeigdyrzt6ic3b7q4tf6h3y2x4cn27lu5ps5h7izngyztby6cd3k6da' }, observedAt: '2026-07-16T12:00:00.000Z' });
if (attestation.kind !== 'created') throw new Error('Public EAS constructor rejected a valid event');
console.log(attestation.attestation.eventDigest);
`,
    'utf8',
  );
  execFileSync('node', ['consumer.mjs'], { cwd: temporaryDirectory, encoding: 'utf8' });
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
