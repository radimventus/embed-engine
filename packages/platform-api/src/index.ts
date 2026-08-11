import { createHash, randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export type PlatformInviteStatus =
  | 'pending'
  | 'activated'
  | 'revoked'
  | 'expired';

export type PlatformInviteScope = {
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly string[];
  readonly invitedByUserId: string;
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly expiresAt?: string;
};

export type ResolvedPlatformInvite = Omit<
  PlatformInviteScope,
  'invitedByUserId'
> & {
  readonly id: string;
  readonly status: PlatformInviteStatus;
  readonly createdAt: string;
  readonly activatedAt: string | null;
  readonly ndaAcceptedAt: string | null;
  readonly expiresAt: string;
};

export type IssuedPlatformInvite = ResolvedPlatformInvite & {
  /** Returned only by a local-pilot create or reissue response. */
  readonly token: string;
};

export type InviteActivation =
  | { readonly ok: true; readonly invite: ResolvedPlatformInvite }
  | { readonly ok: false; readonly error: string };

/** Persistence boundary used by the minimal Platform API process. */
export interface PlatformInviteRepository {
  create(input: PlatformInviteScope): Promise<IssuedPlatformInvite>;
  resolve(token: string): Promise<ResolvedPlatformInvite | null>;
  activate(token: string, ndaAccepted: boolean): Promise<InviteActivation>;
  reissue(id: string): Promise<IssuedPlatformInvite | null>;
  revoke(id: string): Promise<ResolvedPlatformInvite | null>;
}

type StoredInvite = ResolvedPlatformInvite & {
  readonly verifier: string;
  readonly invitedByUserId: string;
};

type InviteState = {
  readonly invites: readonly StoredInvite[];
};

const INVITE_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;

function lifecycle(invite: StoredInvite, now = Date.now()): PlatformInviteStatus {
  if (invite.status !== 'pending') return invite.status;
  return Date.parse(invite.expiresAt) < now ? 'expired' : 'pending';
}

function toResolved(invite: StoredInvite): ResolvedPlatformInvite {
  const {
    verifier: _verifier,
    invitedByUserId: _invitedByUserId,
    ...resolved
  } = invite;
  return { ...resolved, status: lifecycle(invite) };
}

function tokenVerifier(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function issueToken(): string {
  return randomBytes(32).toString('base64url');
}

function defaultStatePath(): string {
  return join(tmpdir(), 'embed-engine-platform-api', 'invites.json');
}

export class FilePlatformInviteRepository implements PlatformInviteRepository {
  readonly statePath: string;
  private mutation: Promise<void> = Promise.resolve();

  constructor(statePath = defaultStatePath()) {
    this.statePath = statePath;
  }

  async create(input: PlatformInviteScope): Promise<IssuedPlatformInvite> {
    const token = issueToken();
    const now = new Date().toISOString();
    const invite: StoredInvite = {
      id: `invite-${randomBytes(12).toString('base64url')}`,
      email: input.email.trim().toLowerCase(),
      displayName: input.displayName.trim() || input.email.trim(),
      roles: [...input.roles],
      invitedByUserId: input.invitedByUserId,
      tenantId: input.tenantId,
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      status: 'pending',
      createdAt: now,
      activatedAt: null,
      ndaAcceptedAt: null,
      expiresAt:
        input.expiresAt ??
        new Date(Date.parse(now) + INVITE_VALIDITY_MS).toISOString(),
      verifier: tokenVerifier(token),
    };
    const state = await this.read();
    await this.write({ invites: [...state.invites, invite] });
    return { ...toResolved(invite), token };
  }

  async resolve(token: string): Promise<ResolvedPlatformInvite | null> {
    const invite = (await this.read()).invites.find(
      (item) => item.verifier === tokenVerifier(token),
    );
    if (invite === undefined) return null;
    return toResolved(invite);
  }

  async activate(token: string, ndaAccepted: boolean): Promise<InviteActivation> {
    return this.exclusively(async () => {
      if (!ndaAccepted) {
        return { ok: false, error: 'Bez souhlasu s NDA není aktivace účtu možná.' };
      }
      const state = await this.read();
      const index = state.invites.findIndex(
        (item) => item.verifier === tokenVerifier(token),
      );
      if (index < 0) return { ok: false, error: 'Pozvánka neexistuje.' };
      const current = state.invites[index]!;
      const stateNow = lifecycle(current);
      if (stateNow !== 'pending') {
        return {
          ok: false,
          error:
            stateNow === 'expired'
              ? 'Platnost pozvánky vypršela. Požádejte o nové odeslání.'
              : stateNow === 'revoked'
                ? 'Pozvánka byla zrušena.'
                : 'Pozvánka už byla aktivována.',
        };
      }
      const activatedAt = new Date().toISOString();
      const activated: StoredInvite = {
        ...current,
        status: 'activated',
        activatedAt,
        ndaAcceptedAt: activatedAt,
      };
      const invites = [...state.invites];
      invites[index] = activated;
      await this.write({ invites });
      return { ok: true, invite: toResolved(activated) };
    });
  }

  async reissue(id: string): Promise<IssuedPlatformInvite | null> {
    const state = await this.read();
    const index = state.invites.findIndex((item) => item.id === id);
    if (index < 0) return null;
    const current = state.invites[index]!;
    if (lifecycle(current) === 'activated' || lifecycle(current) === 'revoked') {
      return null;
    }
    const token = issueToken();
    const now = new Date().toISOString();
    const reissued: StoredInvite = {
      ...current,
      status: 'pending',
      verifier: tokenVerifier(token),
      createdAt: now,
      expiresAt: new Date(Date.parse(now) + INVITE_VALIDITY_MS).toISOString(),
    };
    const invites = [...state.invites];
    invites[index] = reissued;
    await this.write({ invites });
    return { ...toResolved(reissued), token };
  }

  async revoke(id: string): Promise<ResolvedPlatformInvite | null> {
    const state = await this.read();
    const index = state.invites.findIndex((item) => item.id === id);
    if (index < 0) return null;
    const current = state.invites[index]!;
    if (lifecycle(current) !== 'pending') return null;
    const revoked: StoredInvite = { ...current, status: 'revoked' };
    const invites = [...state.invites];
    invites[index] = revoked;
    await this.write({ invites });
    return toResolved(revoked);
  }

  private async read(): Promise<InviteState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as InviteState;
      return { invites: Array.isArray(parsed.invites) ? parsed.invites : [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { invites: [] };
      throw error;
    }
  }

  private async write(state: InviteState): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });
    const temporaryPath = `${this.statePath}.${randomBytes(6).toString('hex')}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(state), { mode: 0o600 });
    await rename(temporaryPath, this.statePath);
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}

function isLoopback(request: IncomingMessage): boolean {
  const address = request.socket.remoteAddress;
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

async function requestBody(request: IncomingMessage): Promise<unknown> {
  let body = '';
  for await (const chunk of request) body += String(chunk);
  return body.length === 0 ? {} : JSON.parse(body) as unknown;
}

function respond(
  response: import('node:http').ServerResponse,
  status: number,
  body: unknown,
): void {
  response.writeHead(status, {
    'content-type': 'application/json',
  });
  response.end(JSON.stringify(body));
}

export function createPlatformApiServer(
  repository: PlatformInviteRepository = new FilePlatformInviteRepository(),
): Server {
  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    const allowedOrigins = new Set([
      'http://127.0.0.1:4175',
      'http://127.0.0.1:4181',
    ]);
    if (origin !== undefined && allowedOrigins.has(origin)) {
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('vary', 'origin');
      response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
      response.setHeader('access-control-allow-headers', 'content-type');
    }
    if (request.method === 'OPTIONS') return respond(response, 204, {});
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    try {
      if (request.method === 'GET' && path.startsWith('/public/invites/')) {
        const token = decodeURIComponent(path.slice('/public/invites/'.length));
        const invite = await repository.resolve(token);
        return respond(response, invite === null ? 404 : 200, invite ?? { error: 'Pozvánka neexistuje.' });
      }
      if (request.method === 'POST' && path.startsWith('/public/invites/') && path.endsWith('/activate')) {
        const token = decodeURIComponent(
          path.slice('/public/invites/'.length, -'/activate'.length),
        );
        const body = await requestBody(request) as { ndaAccepted?: boolean };
        const result = await repository.activate(token, body.ndaAccepted === true);
        return respond(response, result.ok ? 200 : 409, result);
      }
      if (!isLoopback(request)) return respond(response, 403, { error: 'Local-pilot access requires loopback.' });
      if (request.method === 'POST' && path === '/local-pilot/invites') {
        return respond(response, 201, await repository.create(await requestBody(request) as PlatformInviteScope));
      }
      const privateMatch = path.match(/^\/local-pilot\/invites\/([^/]+)\/(reissue|revoke)$/);
      if (request.method === 'POST' && privateMatch !== null) {
        const [, id, action] = privateMatch;
        const result =
          action === 'reissue'
            ? await repository.reissue(id!)
            : await repository.revoke(id!);
        return respond(response, result === null ? 404 : 200, result ?? { error: 'Pozvánka není dostupná.' });
      }
      return respond(response, 404, { error: 'Nenalezeno.' });
    } catch {
      return respond(response, 400, { error: 'Neplatný požadavek.' });
    }
  });
}
