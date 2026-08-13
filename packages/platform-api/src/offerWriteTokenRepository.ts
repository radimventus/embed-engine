import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { platformApiStatePath } from './platformApiConfig';

export type OfferWriteCapabilityScope = {
  readonly offerSlug: string;
  readonly companyId: string;
  readonly partnerId: string;
  readonly expiresAt?: string;
};

export type OfferWriteCapability = Omit<OfferWriteCapabilityScope, 'expiresAt'> & {
  readonly id: string;
  readonly expiresAt: string;
  readonly orderId: string | null;
};

export type IssuedOfferWriteCapability = OfferWriteCapability & {
  readonly token: string;
};

export interface OfferWriteTokenRepository {
  issue(scope: OfferWriteCapabilityScope): Promise<IssuedOfferWriteCapability>;
  getOrIssue(scope: OfferWriteCapabilityScope): Promise<IssuedOfferWriteCapability>;
  bindOrder(token: string, input: {
    readonly offerSlug: string;
    readonly companyId: string;
    readonly partnerId: string;
    readonly orderId: string;
  }): Promise<boolean>;
  verifyOrder(token: string, orderId: string): Promise<boolean>;
}

type StoredCapability = OfferWriteCapability & {
  readonly verifier: string;
  readonly encryptedToken?: string;
};
type CapabilityState = { readonly capabilities: readonly StoredCapability[] };
const CAPABILITY_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_VERSION = 'v1';

function defaultStatePath(): string {
  return platformApiStatePath('offer-write-capabilities.json');
}

function verifier(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function encryptionKey(): Buffer {
  const configured = process.env.OFFER_CAPABILITY_ENCRYPTION_KEY?.trim();
  if (configured === undefined || configured.length === 0) {
    throw new Error('OFFER_CAPABILITY_ENCRYPTION_KEY must be configured.');
  }
  const key = Buffer.from(configured, 'base64url');
  if (key.length !== 32) {
    throw new Error('OFFER_CAPABILITY_ENCRYPTION_KEY must be a base64url-encoded 32-byte key.');
  }
  return key;
}

function encryptToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENCRYPTION_VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

function decryptToken(encryptedToken: string): string {
  const [version, iv, tag, ciphertext] = encryptedToken.split('.');
  if (
    version !== ENCRYPTION_VERSION ||
    iv === undefined ||
    tag === undefined ||
    ciphertext === undefined
  ) {
    throw new Error('Stored offer write capability cannot be decrypted.');
  }
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    encryptionKey(),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function active(capability: StoredCapability): boolean {
  return Date.parse(capability.expiresAt) > Date.now();
}

function resolved(capability: StoredCapability): OfferWriteCapability {
  const {
    verifier: _verifier,
    encryptedToken: _encryptedToken,
    ...value
  } = capability;
  return value;
}

export class FileOfferWriteTokenRepository implements OfferWriteTokenRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(readonly statePath = defaultStatePath()) {}

  async issue(scope: OfferWriteCapabilityScope): Promise<IssuedOfferWriteCapability> {
    const { capability, token } = this.createCapability(scope);
    await this.mutate((state) => ({ capabilities: [...state.capabilities, capability] }));
    return { ...resolved(capability), token };
  }

  async getOrIssue(
    scope: OfferWriteCapabilityScope,
  ): Promise<IssuedOfferWriteCapability> {
    return this.exclusively(async () => {
      const state = await this.read();
      const existing = state.capabilities.find(
        (capability) =>
          active(capability) &&
          capability.offerSlug === scope.offerSlug.trim().toLowerCase() &&
          capability.companyId === scope.companyId.trim() &&
          capability.partnerId === scope.partnerId.trim(),
      );
      if (existing !== undefined) {
        if (existing.encryptedToken === undefined) {
          throw new Error(
            'Active offer write capability predates encrypted persistence and cannot be recovered.',
          );
        }
        const token = decryptToken(existing.encryptedToken);
        if (verifier(token) !== existing.verifier) {
          throw new Error('Stored offer write capability does not match its verifier.');
        }
        return { ...resolved(existing), token };
      }

      const { capability, token } = this.createCapability(scope);
      await this.write({ capabilities: [...state.capabilities, capability] });
      return { ...resolved(capability), token };
    });
  }

  async bindOrder(token: string, input: {
    readonly offerSlug: string;
    readonly companyId: string;
    readonly partnerId: string;
    readonly orderId: string;
  }): Promise<boolean> {
    return this.mutate((state) => {
      const index = state.capabilities.findIndex((item) => item.verifier === verifier(token));
      const current = state.capabilities[index];
      if (
        current === undefined ||
        !active(current) ||
        current.offerSlug !== input.offerSlug ||
        current.companyId !== input.companyId ||
        current.partnerId !== input.partnerId ||
        (current.orderId !== null && current.orderId !== input.orderId)
      ) return state;
      const capabilities = [...state.capabilities];
      capabilities[index] = { ...current, orderId: input.orderId };
      return { capabilities };
    }).then((state) => state.capabilities.some((item) =>
      item.verifier === verifier(token) && item.orderId === input.orderId,
    ));
  }

  async verifyOrder(token: string, orderId: string): Promise<boolean> {
    return (await this.read()).capabilities.some(
      (item) => item.verifier === verifier(token) && active(item) && item.orderId === orderId,
    );
  }

  private createCapability(scope: OfferWriteCapabilityScope): {
    readonly capability: StoredCapability;
    readonly token: string;
  } {
    const token = randomBytes(32).toString('base64url');
    const capability: StoredCapability = {
      id: `offer-write-${randomBytes(12).toString('base64url')}`,
      offerSlug: scope.offerSlug.trim().toLowerCase(),
      companyId: scope.companyId.trim(),
      partnerId: scope.partnerId.trim(),
      expiresAt:
        scope.expiresAt ??
        new Date(Date.now() + CAPABILITY_VALIDITY_MS).toISOString(),
      orderId: null,
      verifier: verifier(token),
      encryptedToken: encryptToken(token),
    };
    if (!capability.offerSlug || !capability.companyId || !capability.partnerId) {
      throw new Error('Invalid offer write capability scope.');
    }
    return { capability, token };
  }

  private async read(): Promise<CapabilityState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as CapabilityState;
      return { capabilities: Array.isArray(parsed.capabilities) ? parsed.capabilities : [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { capabilities: [] };
      throw error;
    }
  }

  private async mutate(update: (state: CapabilityState) => CapabilityState): Promise<CapabilityState> {
    return this.exclusively(async () => {
      const next = update(await this.read());
      await this.write(next);
      return next;
    });
  }

  private async write(state: CapabilityState): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });
    const temporary = `${this.statePath}.tmp`;
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, this.statePath);
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try { return await operation(); } finally { release(); }
  }
}
