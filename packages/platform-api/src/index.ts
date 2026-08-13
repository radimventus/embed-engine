import { createHash, randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  buildDocumentContextFromPayload,
  createDocumentRuntime,
} from '@embed-engine/document-runtime';

import {
  FileSocialProofAnalyticsRepository,
  type SocialProofAnalyticsRepository,
} from './socialProofAnalytics';
import {
  FileOrderRepository,
  OrderAlreadyExistsError,
  type OrderRepository,
} from './orderRepository';
import {
  FileProformaRepository,
  type ProformaRepository,
} from './proformaRepository';
import {
  FileOfferWriteTokenRepository,
  type OfferWriteTokenRepository,
} from './offerWriteTokenRepository';
import { platformApiAllowedOrigins, platformApiStatePath } from './platformApiConfig';

export {
  FileSocialProofAnalyticsRepository,
  type RecentHouseActivity,
  type SocialProofAggregate,
  type SocialProofAnalyticsEventInput,
  type SocialProofAnalyticsRepository,
} from './socialProofAnalytics';
export {
  FileOrderRepository,
  type DurableOrder,
  type DurableOrderInput,
  type OrderRepository,
  OrderAlreadyExistsError,
} from './orderRepository';
export {
  buildSpdQrPayload,
  COMMERCIAL_PAYMENT_ACCOUNT,
  dueDateFromIssuedAt,
  FileProformaRepository,
  type DurableProforma,
  type ProformaIssuance,
  type ProformaRepository,
  variableSymbolFromOrderId,
} from './proformaRepository';
export {
  FileOfferWriteTokenRepository,
  type OfferWriteCapability,
  type OfferWriteCapabilityScope,
  type OfferWriteTokenRepository,
} from './offerWriteTokenRepository';
export {
  platformApiAllowedOrigins,
  platformApiHost,
  platformApiPort,
  platformApiStatePath,
} from './platformApiConfig';

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
  return platformApiStatePath('invites.json');
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

/**
 * The Offer checkout is the only public capability surface under
 * `/local-pilot`. Every other local-pilot operation remains operator-local.
 */
export function requiresLoopbackAccess(
  method: string | undefined,
  path: string,
): boolean {
  if (method === 'POST' && path === '/local-pilot/orders') return false;
  if (
    method === 'POST' &&
    /^\/local-pilot\/orders\/[^/]+\/proforma$/.test(path)
  ) {
    return false;
  }
  if (
    method === 'GET' &&
    (
      /^\/local-pilot\/orders\/[^/]+$/.test(path) ||
      /^\/local-pilot\/orders\/[^/]+\/proforma$/.test(path) ||
      /^\/local-pilot\/orders\/[^/]+\/proforma\/pdf$/.test(path)
    )
  ) {
    return false;
  }
  return true;
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

function bearerToken(request: IncomingMessage): string | null {
  const value = request.headers.authorization;
  const match = value?.match(/^Bearer ([A-Za-z0-9_-]{20,})$/);
  return match?.[1] ?? null;
}

export function createPlatformApiServer(
  repository: PlatformInviteRepository = new FilePlatformInviteRepository(),
  socialProofRepository: SocialProofAnalyticsRepository = new FileSocialProofAnalyticsRepository(),
  orderRepository: OrderRepository = new FileOrderRepository(),
  proformaRepository: ProformaRepository = new FileProformaRepository(),
  offerWriteTokens: OfferWriteTokenRepository = new FileOfferWriteTokenRepository(),
): Server {
  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    const allowedOrigins = platformApiAllowedOrigins();
    if (origin !== undefined && allowedOrigins.has(origin)) {
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('vary', 'origin');
      response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
      response.setHeader('access-control-allow-headers', 'content-type, authorization');
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
      if (requiresLoopbackAccess(request.method, path) && !isLoopback(request)) {
        return respond(response, 403, { error: 'Local-pilot access requires loopback.' });
      }
      if (request.method === 'POST' && path === '/local-pilot/social-proof/events') {
        await socialProofRepository.record(
          await requestBody(request) as import('./socialProofAnalytics').SocialProofAnalyticsEventInput,
        );
        return respond(response, 202, { accepted: true });
      }
      if (request.method === 'GET' && path === '/local-pilot/social-proof/aggregate') {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const companyId = url.searchParams.get('companyId');
        const projectId = url.searchParams.get('projectId');
        const houseId = url.searchParams.get('houseId');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (companyId === null || projectId === null || houseId === null || from === null || to === null) {
          return respond(response, 400, { error: 'companyId, projectId, houseId, from a to jsou povinné.' });
        }
        return respond(response, 200, await socialProofRepository.aggregateHouse({ companyId, projectId, houseId, from, to }));
      }
      if (request.method === 'GET' && path === '/local-pilot/social-proof/recent') {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const companyId = url.searchParams.get('companyId');
        const projectId = url.searchParams.get('projectId');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (companyId === null || projectId === null || from === null || to === null) {
          return respond(response, 400, { error: 'companyId, projectId, from a to jsou povinné.' });
        }
        const minimumVisitors = Number.parseInt(url.searchParams.get('minimumVisitors') ?? '2', 10);
        return respond(
          response,
          200,
          await socialProofRepository.recentActivity({
            companyId,
            projectId,
            from,
            to,
            minimumVisitors: Number.isFinite(minimumVisitors) ? Math.max(2, minimumVisitors) : 2,
          }),
        );
      }
      if (request.method === 'POST' && path === '/local-pilot/orders') {
        const token = bearerToken(request);
        if (token === null) return respond(response, 401, { error: 'Offer write capability is required.' });
        const orderInput = await requestBody(request) as import('./orderRepository').DurableOrderInput;
        const authorized = await offerWriteTokens.bindOrder(token, {
          offerSlug: orderInput.offerSlug,
          companyId: orderInput.companyId,
          partnerId: orderInput.partnerId,
          orderId: orderInput.orderId,
        });
        if (!authorized) return respond(response, 403, { error: 'Offer write capability is not valid for this order.' });
        return respond(
          response,
          201,
          await orderRepository.create(orderInput),
        );
      }
      if (request.method === 'POST' && path === '/local-pilot/offer-write-capabilities') {
        return respond(
          response,
          201,
          await offerWriteTokens.getOrIssue(
            await requestBody(request) as import('./offerWriteTokenRepository').OfferWriteCapabilityScope,
          ),
        );
      }
      const proformaPdfMatch = path.match(/^\/local-pilot\/orders\/([^/]+)\/proforma\/pdf$/);
      if (request.method === 'GET' && proformaPdfMatch !== null) {
        const orderId = decodeURIComponent(proformaPdfMatch[1]!);
        const [order, proforma] = await Promise.all([
          orderRepository.getByOrderId(orderId),
          proformaRepository.getByOrderId(orderId),
        ]);
        if (order === null || proforma === null) {
          return respond(response, 404, { error: 'Objednávka nebo proforma neexistuje.' });
        }
        const artifact = await createDocumentRuntime().generate({
          type: 'proforma',
          businessEventKind: 'ProformaGenerated',
          context: buildDocumentContextFromPayload({
            projectId: order.orderId,
            issuedAt: proforma.issuedAt,
            payload: {
              partnerName: order.partner.partnerName,
              companyName: order.partner.companyName,
              packageName: order.package.name,
              orderId: order.orderId,
              proformaNumber: proforma.number,
              amountCzk: proforma.amountCzk,
              dueDate: proforma.dueDate,
              contactEmail: order.partner.email,
              variableSymbol: proforma.variableSymbol,
              bankAccountNumber: proforma.bankAccount.accountNumber,
              bankIban: proforma.bankAccount.iban,
              spdPayload: proforma.spdPayload,
            },
          }),
        });
        return respond(response, 200, artifact);
      }
      const orderProformaMatch = path.match(/^\/local-pilot\/orders\/([^/]+)\/proforma$/);
      if (orderProformaMatch !== null) {
        const orderId = decodeURIComponent(orderProformaMatch[1]!);
        if (request.method === 'POST') {
          const token = bearerToken(request);
          if (token === null || !await offerWriteTokens.verifyOrder(token, orderId)) {
            return respond(response, 401, { error: 'Offer write capability is required.' });
          }
          const order = await orderRepository.getByOrderId(orderId);
          if (order === null) {
            return respond(response, 404, { error: 'Objednávka neexistuje.' });
          }
          const result = await proformaRepository.issue(order);
          return respond(response, result.created ? 201 : 200, result.proforma);
        }
        if (request.method === 'GET') {
          const proforma = await proformaRepository.getByOrderId(orderId);
          return respond(response, proforma === null ? 404 : 200, proforma ?? { error: 'Proforma neexistuje.' });
        }
      }
      if (request.method === 'GET' && path.startsWith('/local-pilot/proformas/')) {
        const proformaId = decodeURIComponent(path.slice('/local-pilot/proformas/'.length));
        const proforma = await proformaRepository.getByProformaId(proformaId);
        return respond(response, proforma === null ? 404 : 200, proforma ?? { error: 'Proforma neexistuje.' });
      }
      if (request.method === 'GET' && path.startsWith('/local-pilot/orders/')) {
        const orderId = decodeURIComponent(path.slice('/local-pilot/orders/'.length));
        const order = await orderRepository.getByOrderId(orderId);
        return respond(response, order === null ? 404 : 200, order ?? { error: 'Objednávka neexistuje.' });
      }
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
    } catch (error) {
      if (error instanceof OrderAlreadyExistsError) {
        return respond(response, 409, { error: 'Objednávka již existuje.' });
      }
      return respond(response, 400, { error: 'Neplatný požadavek.' });
    }
  });
}
