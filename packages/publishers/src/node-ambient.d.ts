declare module 'node:crypto' {
  export interface KeyPairSyncResult<TPublicKey, TPrivateKey> {
    readonly publicKey: TPublicKey;
    readonly privateKey: TPrivateKey;
  }

  export function generateKeyPairSync(
    type: 'ed25519',
    options: {
      readonly publicKeyEncoding: { readonly type: 'spki'; readonly format: 'pem' };
      readonly privateKeyEncoding: { readonly type: 'pkcs8'; readonly format: 'pem' };
    },
  ): KeyPairSyncResult<string, string>;

  export function sign(
    algorithm: null,
    data: Uint8Array,
    privateKey: string,
  ): { toString(encoding: 'base64'): string };

  export function verify(
    algorithm: null,
    data: Uint8Array,
    publicKey: string,
    signature: Uint8Array,
  ): boolean;
}

declare module 'node:fs/promises' {
  export function mkdir(
    path: string,
    options: { readonly recursive: true },
  ): Promise<string | undefined>;
  export function mkdtemp(prefix: string): Promise<string>;
  export function readFile(path: string, encoding: 'utf8'): Promise<string>;
  export function rm(
    path: string,
    options: { readonly recursive?: boolean; readonly force?: boolean },
  ): Promise<void>;
  export function writeFile(path: string, data: string, encoding: 'utf8'): Promise<void>;
}

declare module 'node:os' {
  export function tmpdir(): string;
}

declare module 'node:path' {
  export function join(...paths: readonly string[]): string;
}

declare module 'node:url' {
  export function pathToFileURL(path: string): { readonly href: string };
}

declare const Buffer: {
  byteLength(value: string, encoding: 'utf8'): number;
  from(value: string, encoding: 'base64' | 'hex'): Uint8Array;
};
