import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

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
  bindOrder(token: string, input: {
    readonly offerSlug: string;
    readonly companyId: string;
    readonly partnerId: string;
    readonly orderId: string;
  }): Promise<boolean>;
  verifyOrder(token: string, orderId: string): Promise<boolean>;
}

type StoredCapability = OfferWriteCapability & { readonly verifier: string };
type CapabilityState = { readonly capabilities: readonly StoredCapability[] };
const CAPABILITY_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;

function defaultStatePath(): string {
  return join(tmpdir(), 'embed-engine-platform-api', 'offer-write-capabilities.json');
}

function verifier(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function active(capability: StoredCapability): boolean {
  return Date.parse(capability.expiresAt) > Date.now();
}

function resolved(capability: StoredCapability): OfferWriteCapability {
  const { verifier: _verifier, ...value } = capability;
  return value;
}

export class FileOfferWriteTokenRepository implements OfferWriteTokenRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(readonly statePath = defaultStatePath()) {}

  async issue(scope: OfferWriteCapabilityScope): Promise<IssuedOfferWriteCapability> {
    const token = randomBytes(32).toString('base64url');
    const capability: StoredCapability = {
      id: `offer-write-${randomBytes(12).toString('base64url')}`,
      offerSlug: scope.offerSlug.trim().toLowerCase(),
      companyId: scope.companyId.trim(),
      partnerId: scope.partnerId.trim(),
      expiresAt: scope.expiresAt ?? new Date(Date.now() + CAPABILITY_VALIDITY_MS).toISOString(),
      orderId: null,
      verifier: verifier(token),
    };
    if (!capability.offerSlug || !capability.companyId || !capability.partnerId) {
      throw new Error('Invalid offer write capability scope.');
    }
    await this.mutate((state) => ({ capabilities: [...state.capabilities, capability] }));
    return { ...resolved(capability), token };
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
      await mkdir(dirname(this.statePath), { recursive: true });
      const temporary = `${this.statePath}.tmp`;
      await writeFile(temporary, JSON.stringify(next), { mode: 0o600 });
      await rename(temporary, this.statePath);
      return next;
    });
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try { return await operation(); } finally { release(); }
  }
}
