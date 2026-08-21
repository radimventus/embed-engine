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
  FileLeadRepository,
  LeadAlreadyExistsError,
  LeadNotFoundError,
  type LeadRepository,
} from './leadRepository';
import {
  CaseProcessingNotFoundError,
  FileCaseProcessingRepository,
  type CaseProcessingRepository,
} from './caseProcessingRepository';
import { resolveLeadScope, resolvePublicHouseScope } from './leadScope';
import {
  DecisionSessionScopeMismatchError,
  FileDecisionSessionRepository,
  type DecisionSessionRepository,
} from './decisionSessionRepository';
import {
  isDecisionSessionId,
  toOperationalDecisionSnapshot,
} from './decisionSessionRecord';
import {
  FileProjectConfigRepository,
  type ProjectConfigRepository,
} from './projectConfigRepository';
import {
  DuplicateOfficePartnerError,
  FileOfficePartnerRepository,
  InvalidOfficePartnerError,
  OfficePartnerNotFoundError,
  type OfficePartnerRepository,
} from './officePartnerRepository';
import {
  FileProformaRepository,
  type ProformaRepository,
} from './proformaRepository';
import {
  FileOfferWriteTokenRepository,
  type OfferWriteTokenRepository,
} from './offerWriteTokenRepository';
import {
  FilePartnerSessionRepository,
  type PartnerSessionRepository,
} from './partnerSessionRepository';
import {
  FileHousePackageRepository,
  type HousePackageRepository,
  type HousePackagePersistFiles,
} from './housePackageRepository';
import { platformApiAllowedOrigins, platformApiStatePath } from './platformApiConfig';
import {
  applyDurableProjectConfigs,
  canonicalCompanyIdForOfficePartner,
  findCompany,
  getCanonicalProject,
  getDefaultCompanyRegistry,
  projectPublicCompanyContact,
} from '@embed-engine/platform-access';
import {
  canAccessStudio,
  isPlatformAdmin,
  type PlatformRole,
} from '@embed-engine/platform-access/rbac';

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
  FileLeadRepository,
  type DurableLead,
  type DurableLeadInput,
  type LeadRepository,
  type LeadScopeQuery,
  LeadAlreadyExistsError,
  LeadNotFoundError,
} from './leadRepository';
export {
  FileCaseProcessingRepository,
  CaseProcessingNotFoundError,
  isReferenceOperationalCaseId,
  type CaseProcessingRecord,
  type CaseProcessingRepository,
} from './caseProcessingRepository';
export {
  FileDecisionSessionRepository,
  DecisionSessionScopeMismatchError,
  type DecisionSessionRepository,
  type DecisionSessionScopeQuery,
} from './decisionSessionRepository';
export {
  isDecisionSessionId,
  sanitizeSerializedDecisionSession,
  toOperationalDecisionSnapshot,
  type DurableDecisionSessionRecord,
  type DurableSerializedDecisionSession,
} from './decisionSessionRecord';
export {
  FileProjectConfigRepository,
  type DurableProjectConfig,
  type DurableProjectConfigInput,
  type ProjectConfigRepository,
} from './projectConfigRepository';
export {
  DuplicateOfficePartnerError,
  FileOfficePartnerRepository,
  InvalidOfficePartnerError,
  OfficePartnerNotFoundError,
  type DurableOfficePartnerInput,
  type OfficePartnerRepository,
} from './officePartnerRepository';
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
  FilePartnerSessionRepository,
  type IssuedPartnerSession,
  type PartnerIdentity,
  type PartnerSessionRepository,
} from './partnerSessionRepository';
export {
  FileHousePackageRepository,
  type DurableHousePackage,
  type HousePackageMedia,
  type HousePackagePersistFiles,
  type HousePackageRepository,
} from './housePackageRepository';
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
  readonly roles: readonly PlatformRole[];
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

async function requestBytes(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += bytes.length;
    if (length > 25 * 1024 * 1024) {
      throw new Error('House Package media exceeds 25 MiB.');
    }
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
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

function respondMedia(
  response: import('node:http').ServerResponse,
  contentType: string,
  bytes: Buffer,
): void {
  response.writeHead(200, {
    'content-type': contentType,
    'content-length': bytes.length,
    'cache-control': 'private, no-store',
  });
  response.end(bytes);
}

function bearerToken(request: IncomingMessage): string | null {
  const value = request.headers.authorization;
  const match = value?.match(/^Bearer ([A-Za-z0-9_-]{20,})$/);
  return match?.[1] ?? null;
}

const PARTNER_SESSION_COOKIE = '__Host-conis_partner_session';

function requestCookie(request: IncomingMessage, name: string): string | null {
  const value = request.headers.cookie;
  if (value === undefined) return null;
  const part = value.split(';').map((item) => item.trim()).find(
    (item) => item.startsWith(`${name}=`),
  );
  return part === undefined ? null : decodeURIComponent(part.slice(name.length + 1));
}

function sessionRoles(
  session: { readonly user?: { readonly roles?: readonly PlatformRole[] } },
): readonly PlatformRole[] {
  return session.user?.roles ?? [];
}

function sessionCompanyId(
  session: {
    readonly companyId?: string;
    readonly workspaceContext?: { readonly companyId?: string } | null;
  },
): string {
  return (session.workspaceContext?.companyId ?? session.companyId ?? '').trim();
}

function canAuthorOfficePartners(
  session: {
    readonly user?: { readonly roles?: readonly PlatformRole[] };
  },
): boolean {
  return isPlatformAdmin(sessionRoles(session));
}

function canMutateOfficePartner(
  session: {
    readonly companyId?: string;
    readonly workspaceContext?: { readonly companyId?: string } | null;
    readonly user?: { readonly roles?: readonly PlatformRole[] };
  },
  partnerCompanyId: string,
): boolean {
  const roles = sessionRoles(session);
  if (roles.includes('conis-admin')) return true;
  if (!isPlatformAdmin(roles)) return false;
  return sessionCompanyId(session) === partnerCompanyId;
}

function officePartnerDraftFromBody(body: unknown): {
  readonly id?: string;
  readonly name: unknown;
  readonly status: unknown;
  readonly nextStep: unknown;
  readonly company: unknown;
  readonly contact: unknown;
} | null {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const record = body as Record<string, unknown>;
  return {
    id: typeof record.id === 'string' ? record.id : undefined,
    name: record.name,
    status: record.status,
    nextStep: record.nextStep,
    company: record.company,
    contact: record.contact,
  };
}

function setPartnerSessionCookie(
  response: import('node:http').ServerResponse,
  token: string,
  expiresAt: string,
): void {
  const maxAge = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1_000));
  response.setHeader(
    'set-cookie',
    `${PARTNER_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`,
  );
}

function clearPartnerSessionCookie(
  response: import('node:http').ServerResponse,
): void {
  response.setHeader(
    'set-cookie',
    `${PARTNER_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  );
}

export function createPlatformApiServer(
  repository: PlatformInviteRepository = new FilePlatformInviteRepository(),
  socialProofRepository: SocialProofAnalyticsRepository = new FileSocialProofAnalyticsRepository(),
  orderRepository: OrderRepository = new FileOrderRepository(),
  proformaRepository: ProformaRepository = new FileProformaRepository(),
  offerWriteTokens: OfferWriteTokenRepository = new FileOfferWriteTokenRepository(),
  partnerSessions: PartnerSessionRepository = new FilePartnerSessionRepository(),
  housePackages: HousePackageRepository = new FileHousePackageRepository(),
  leads: LeadRepository = new FileLeadRepository(),
  leadScopeResolver: typeof resolveLeadScope = resolveLeadScope,
  projectConfigs: ProjectConfigRepository = new FileProjectConfigRepository(),
  officePartners: OfficePartnerRepository = new FileOfficePartnerRepository(),
  decisionSessions: DecisionSessionRepository = new FileDecisionSessionRepository(),
  caseProcessing: CaseProcessingRepository = new FileCaseProcessingRepository(),
): Server {
  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    const allowedOrigins = platformApiAllowedOrigins();
    if (origin !== undefined && allowedOrigins.has(origin)) {
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('vary', 'origin');
      response.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
      response.setHeader('access-control-allow-headers', 'content-type, authorization');
      response.setHeader('access-control-allow-credentials', 'true');
    }
    if (request.method === 'OPTIONS') return respond(response, 204, {});
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    try {
      if (
        (request.method === 'PUT' || request.method === 'GET') &&
        path === '/public/decision-sessions'
      ) {
        applyDurableProjectConfigs(await projectConfigs.list());
        if (request.method === 'PUT') {
          const rawBody = await requestBody(request);
          if (
            typeof rawBody !== 'object' ||
            rawBody === null ||
            Array.isArray(rawBody)
          ) {
            return respond(response, 400, { error: 'Neplatná relace rozhodnutí.' });
          }
          const candidate = rawBody as Record<string, unknown>;
          if (
            typeof candidate.decisionSessionId !== 'string' ||
            !isDecisionSessionId(candidate.decisionSessionId) ||
            typeof candidate.companyId !== 'string' ||
            typeof candidate.projectId !== 'string' ||
            typeof candidate.houseId !== 'string'
          ) {
            return respond(response, 400, { error: 'Neplatná relace rozhodnutí.' });
          }
          let scope;
          try {
            scope = resolvePublicHouseScope({
              companyId: candidate.companyId,
              projectId: candidate.projectId,
              houseId: candidate.houseId,
            });
          } catch {
            return respond(response, 400, { error: 'Neplatný rozsah.' });
          }
          try {
            const record = await decisionSessions.upsert({
              decisionSessionId: candidate.decisionSessionId.trim(),
              companyId: scope.companyId,
              projectId: scope.projectId,
              houseId: scope.houseId,
              serialized: candidate.serialized,
            });
            return respond(response, 200, {
              decisionSessionId: record.decisionSessionId,
              companyId: record.companyId,
              projectId: record.projectId,
              houseId: record.houseId,
              createdAt: record.createdAt,
              updatedAt: record.updatedAt,
            });
          } catch (error) {
            if (error instanceof DecisionSessionScopeMismatchError) {
              return respond(response, 409, { error: 'Relace rozhodnutí nepatří tomuto domu.' });
            }
            return respond(response, 400, { error: 'Neplatná relace rozhodnutí.' });
          }
        }

        const url = new URL(request.url ?? '/', 'http://localhost');
        const decisionSessionId = url.searchParams.get('decisionSessionId')?.trim() ?? '';
        const companyId = url.searchParams.get('companyId')?.trim() ?? '';
        const projectId = url.searchParams.get('projectId')?.trim() ?? '';
        const houseId = url.searchParams.get('houseId')?.trim() ?? '';
        if (
          !isDecisionSessionId(decisionSessionId) ||
          companyId.length === 0 ||
          projectId.length === 0 ||
          houseId.length === 0
        ) {
          return respond(response, 400, { error: 'Neplatný rozsah relace.' });
        }
        let scope;
        try {
          scope = resolvePublicHouseScope({ companyId, projectId, houseId });
        } catch {
          return respond(response, 400, { error: 'Neplatný rozsah.' });
        }
        const record = await decisionSessions.getByScopeAndId({
          companyId: scope.companyId,
          projectId: scope.projectId,
          houseId: scope.houseId,
          decisionSessionId,
        });
        if (record === null) {
          return respond(response, 404, { error: 'Relace rozhodnutí neexistuje.' });
        }
        return respond(response, 200, {
          decisionSessionId: record.decisionSessionId,
          companyId: record.companyId,
          projectId: record.projectId,
          houseId: record.houseId,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          serialized: record.serialized,
        });
      }
      if (request.method === 'POST' && path === '/public/leads') {
        const rawBody = await requestBody(request);
        if (
          typeof rawBody !== 'object' ||
          rawBody === null ||
          Array.isArray(rawBody)
        ) {
          return respond(response, 400, { error: 'Neplatná poptávka.' });
        }

        const candidate = rawBody as Record<string, unknown>;
        const contact = candidate.contact;
        const consent = candidate.consent;

        if (
          typeof candidate.idempotencyKey !== 'string' ||
          candidate.idempotencyKey.trim().length === 0 ||
          typeof candidate.companyId !== 'string' ||
          candidate.companyId.trim().length === 0 ||
          typeof candidate.projectId !== 'string' ||
          candidate.projectId.trim().length === 0 ||
          typeof candidate.houseId !== 'string' ||
          candidate.houseId.trim().length === 0 ||
          candidate.source !== 'EMBED' ||
          candidate.intent !== 'audit' ||
          typeof contact !== 'object' ||
          contact === null ||
          Array.isArray(contact) ||
          typeof (contact as Record<string, unknown>).name !== 'string' ||
          ((contact as Record<string, unknown>).name as string).trim().length === 0 ||
          typeof (contact as Record<string, unknown>).email !== 'string' ||
          ((contact as Record<string, unknown>).email as string).trim().length === 0 ||
          (
            (contact as Record<string, unknown>).phone !== null &&
            typeof (contact as Record<string, unknown>).phone !== 'string'
          ) ||
          typeof consent !== 'object' ||
          consent === null ||
          Array.isArray(consent) ||
          (consent as Record<string, unknown>).accepted !== true ||
          typeof (consent as Record<string, unknown>).acceptedAt !== 'string' ||
          ((consent as Record<string, unknown>).acceptedAt as string).trim().length === 0 ||
          typeof (consent as Record<string, unknown>).privacyUrl !== 'string' ||
          ((consent as Record<string, unknown>).privacyUrl as string).trim().length === 0 ||
          typeof (consent as Record<string, unknown>).privacyVersion !== 'string' ||
          ((consent as Record<string, unknown>).privacyVersion as string).trim().length === 0
        ) {
          return respond(response, 400, { error: 'Neplatná poptávka.' });
        }

        const body = rawBody as Omit<
          import('./leadRepository').DurableLeadInput,
          'leadId' | 'createdAt'
        >;

        let scope;
        try {
          applyDurableProjectConfigs(await projectConfigs.list());
          scope = leadScopeResolver(body);
        } catch {
          return respond(response, 400, { error: 'Neplatný rozsah nebo chybějící zásady soukromí partnera.' });
        }
        if (body.consent?.privacyUrl !== scope.privacyUrl) {
          return respond(response, 400, { error: 'Zásady soukromí neodpovídají partnerovi.' });
        }

        let decisionSessionId: string | null = null;
        const requestedSessionId = candidate.decisionSessionId;
        if (
          requestedSessionId !== undefined &&
          requestedSessionId !== null
        ) {
          if (
            typeof requestedSessionId !== 'string' ||
            !isDecisionSessionId(requestedSessionId)
          ) {
            return respond(response, 400, { error: 'Neplatná relace rozhodnutí.' });
          }
          const sessionRecord = await decisionSessions.getById(requestedSessionId.trim());
          if (sessionRecord !== null) {
            if (
              sessionRecord.companyId !== scope.companyId ||
              sessionRecord.projectId !== scope.projectId ||
              sessionRecord.houseId !== scope.houseId
            ) {
              return respond(response, 400, { error: 'Relace rozhodnutí nepatří tomuto domu.' });
            }
            decisionSessionId = sessionRecord.decisionSessionId;
          }
        }

        const input = {
          ...body,
          companyId: scope.companyId,
          projectId: scope.projectId,
          houseId: scope.houseId,
          consent: { ...body.consent, privacyUrl: scope.privacyUrl },
          decisionSessionId,
          leadId: randomBytes(16).toString('hex'),
          createdAt: new Date().toISOString(),
        };
        try {
          const lead = await leads.create(input);
          return respond(response, 201, {
            leadId: lead.leadId,
            createdAt: lead.createdAt,
            status: lead.status,
          });
        } catch (error) {
          if (error instanceof LeadAlreadyExistsError) {
            return respond(response, 200, {
              leadId: error.lead.leadId,
              createdAt: error.lead.createdAt,
              status: error.lead.status,
            });
          }
          return respond(response, 400, { error: 'Neplatná poptávka.' });
        }
      }
      if (request.method === 'GET' && path === '/partner/leads') {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session =
          token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }
        const roles = sessionRoles(session);
        if (
          !canAccessStudio(roles, 'sales') &&
          !canAccessStudio(roles, 'manager')
        ) {
          return respond(response, 403, { error: 'Přístup k poptávkám není povolen.' });
        }

        const url = new URL(request.url ?? '/', 'http://localhost');
        const companyId = url.searchParams.get('companyId')?.trim() ?? '';
        const projectId = url.searchParams.get('projectId')?.trim() ?? '';
        const houseId = url.searchParams.get('houseId')?.trim() ?? '';
        if (companyId.length === 0 || projectId.length === 0) {
          return respond(response, 400, { error: 'Neplatný rozsah.' });
        }
        if (companyId !== sessionCompanyId(session)) {
          return respond(response, 403, { error: 'Společnost není pro tuto relaci povolena.' });
        }
        const sessionProjectId = (
          session.workspaceContext?.projectId ?? session.projectId ?? ''
        ).trim();
        if (projectId !== sessionProjectId) {
          return respond(response, 403, { error: 'Projekt není pro tuto relaci povolen.' });
        }

        const scoped = await leads.list({
          companyId,
          projectId,
          ...(houseId.length > 0 ? { houseId } : {}),
        });
        return respond(response, 200, {
          leads: scoped.map((item) => ({
            leadId: item.leadId,
            companyId: item.companyId,
            projectId: item.projectId,
            houseId: item.houseId,
            createdAt: item.createdAt,
            source: item.source,
            intent: item.intent,
            status: item.status,
            processingStatus: item.processingStatus,
            contact: item.contact,
            decisionSessionId: item.decisionSessionId ?? null,
          })),
        });
      }
      const acceptMatch = path.match(/^\/partner\/leads\/([^/]+)\/accept$/);
      if (request.method === 'POST' && acceptMatch !== null) {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session =
          token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }
        const roles = sessionRoles(session);
        if (!canAccessStudio(roles, 'sales')) {
          return respond(response, 403, { error: 'Přístup k poptávkám není povolen.' });
        }
        const leadId = decodeURIComponent(acceptMatch[1] ?? '').trim();
        const rawBody = await requestBody(request);
        const body =
          typeof rawBody === 'object' && rawBody !== null && !Array.isArray(rawBody)
            ? (rawBody as Record<string, unknown>)
            : {};
        const companyId =
          typeof body.companyId === 'string' ? body.companyId.trim() : '';
        const projectId =
          typeof body.projectId === 'string' ? body.projectId.trim() : '';
        const houseId =
          typeof body.houseId === 'string' ? body.houseId.trim() : '';
        if (
          leadId.length === 0 ||
          companyId.length === 0 ||
          projectId.length === 0 ||
          houseId.length === 0
        ) {
          return respond(response, 400, { error: 'Neplatný rozsah.' });
        }
        if (companyId !== sessionCompanyId(session)) {
          return respond(response, 403, { error: 'Společnost není pro tuto relaci povolena.' });
        }
        const sessionProjectId = (
          session.workspaceContext?.projectId ?? session.projectId ?? ''
        ).trim();
        if (projectId !== sessionProjectId) {
          return respond(response, 403, { error: 'Projekt není pro tuto relaci povolen.' });
        }
        try {
          const accepted = await leads.accept({
            leadId,
            companyId,
            projectId,
            houseId,
          });
          return respond(response, 200, {
            leadId: accepted.leadId,
            processingStatus: accepted.processingStatus,
          });
        } catch (error) {
          if (error instanceof LeadNotFoundError) {
            return respond(response, 404, { error: 'Poptávka nebyla nalezena.' });
          }
          throw error;
        }
      }
      if (request.method === 'GET' && path === '/partner/case-processing') {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session =
          token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }
        const roles = sessionRoles(session);
        if (
          !canAccessStudio(roles, 'sales') &&
          !canAccessStudio(roles, 'manager')
        ) {
          return respond(response, 403, { error: 'Přístup k poptávkám není povolen.' });
        }
        const url = new URL(request.url ?? '/', 'http://localhost');
        const companyId = url.searchParams.get('companyId')?.trim() ?? '';
        const projectId = url.searchParams.get('projectId')?.trim() ?? '';
        const houseId = url.searchParams.get('houseId')?.trim() ?? '';
        if (companyId.length === 0 || projectId.length === 0) {
          return respond(response, 400, { error: 'Neplatný rozsah.' });
        }
        if (companyId !== sessionCompanyId(session)) {
          return respond(response, 403, { error: 'Společnost není pro tuto relaci povolena.' });
        }
        const sessionProjectId = (
          session.workspaceContext?.projectId ?? session.projectId ?? ''
        ).trim();
        if (projectId !== sessionProjectId) {
          return respond(response, 403, { error: 'Projekt není pro tuto relaci povolen.' });
        }
        const scoped = await caseProcessing.list({
          companyId,
          projectId,
          ...(houseId.length > 0 ? { houseId } : {}),
        });
        return respond(response, 200, {
          cases: scoped.map((item) => ({
            caseId: item.caseId,
            companyId: item.companyId,
            projectId: item.projectId,
            houseId: item.houseId,
            processingStatus: item.processingStatus,
          })),
        });
      }
      if (
        request.method === 'POST' &&
        path === '/partner/case-processing/accept'
      ) {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session =
          token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }
        const roles = sessionRoles(session);
        if (!canAccessStudio(roles, 'sales')) {
          return respond(response, 403, { error: 'Přístup k poptávkám není povolen.' });
        }
        const rawBody = await requestBody(request);
        const body =
          typeof rawBody === 'object' && rawBody !== null && !Array.isArray(rawBody)
            ? (rawBody as Record<string, unknown>)
            : {};
        const caseId =
          typeof body.caseId === 'string' ? body.caseId.trim() : '';
        const companyId =
          typeof body.companyId === 'string' ? body.companyId.trim() : '';
        const projectId =
          typeof body.projectId === 'string' ? body.projectId.trim() : '';
        const houseId =
          typeof body.houseId === 'string' ? body.houseId.trim() : '';
        if (
          caseId.length === 0 ||
          companyId.length === 0 ||
          projectId.length === 0 ||
          houseId.length === 0
        ) {
          return respond(response, 400, { error: 'Neplatný rozsah.' });
        }
        if (companyId !== sessionCompanyId(session)) {
          return respond(response, 403, { error: 'Společnost není pro tuto relaci povolena.' });
        }
        const sessionProjectId = (
          session.workspaceContext?.projectId ?? session.projectId ?? ''
        ).trim();
        if (projectId !== sessionProjectId) {
          return respond(response, 403, { error: 'Projekt není pro tuto relaci povolen.' });
        }
        try {
          const accepted = await caseProcessing.accept({
            caseId,
            companyId,
            projectId,
            houseId,
          });
          return respond(response, 200, {
            caseId: accepted.caseId,
            processingStatus: accepted.processingStatus,
          });
        } catch (error) {
          if (error instanceof CaseProcessingNotFoundError) {
            return respond(response, 404, { error: 'Případ nebyl nalezen.' });
          }
          throw error;
        }
      }
      if (request.method === 'GET' && path === '/partner/decision-sessions') {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session =
          token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }
        const roles = sessionRoles(session);
        if (
          !canAccessStudio(roles, 'sales') &&
          !canAccessStudio(roles, 'manager')
        ) {
          return respond(response, 403, { error: 'Přístup k relacím rozhodnutí není povolen.' });
        }

        const url = new URL(request.url ?? '/', 'http://localhost');
        const companyId = url.searchParams.get('companyId')?.trim() ?? '';
        const projectId = url.searchParams.get('projectId')?.trim() ?? '';
        const houseId = url.searchParams.get('houseId')?.trim() ?? '';
        if (companyId.length === 0 || projectId.length === 0) {
          return respond(response, 400, { error: 'Neplatný rozsah.' });
        }
        if (companyId !== sessionCompanyId(session)) {
          return respond(response, 403, { error: 'Společnost není pro tuto relaci povolena.' });
        }
        const sessionProjectId = (
          session.workspaceContext?.projectId ?? session.projectId ?? ''
        ).trim();
        if (projectId !== sessionProjectId) {
          return respond(response, 403, { error: 'Projekt není pro tuto relaci povolen.' });
        }

        const scoped = await decisionSessions.list({
          companyId,
          projectId,
          ...(houseId.length > 0 ? { houseId } : {}),
        });
        return respond(response, 200, {
          sessions: scoped.map(toOperationalDecisionSnapshot),
        });
      }
      const projectConfigMatch = path.match(/^\/public\/projects\/([^/]+)\/config$/);
      if (projectConfigMatch !== null) {
        const projectId = decodeURIComponent(projectConfigMatch[1] ?? '').trim();
        const canonical = projectId.length === 0 ? null : getCanonicalProject(projectId);
        if (canonical === null || canonical.project.projectId !== projectId) {
          return respond(response, 404, { error: 'Projekt neexistuje.' });
        }

        if (request.method === 'GET') {
          const current = await projectConfigs.get(projectId);
          return respond(response, 200, {
            projectId: canonical.project.projectId,
            privacyUrl: current?.privacyUrl ?? null,
          });
        }

        if (request.method === 'PUT') {
          const token = requestCookie(request, PARTNER_SESSION_COOKIE);
          const session = token === null ? null : await partnerSessions.resolve(token);
          if (session === null) {
            return respond(response, 401, { error: 'Neplatná relace.' });
          }
          const authorizedCompanyId =
            session.workspaceContext?.companyId ?? session.companyId;
          if (canonical.partner.companyId !== authorizedCompanyId) {
            return respond(response, 403, {
              error: 'Projekt není pro tuto relaci povolen.',
            });
          }
          const rawConfig = await requestBody(request);
          const privacyUrl =
            rawConfig !== null &&
            typeof rawConfig === 'object' &&
            !Array.isArray(rawConfig)
              ? (rawConfig as Record<string, unknown>).privacyUrl
              : undefined;
          try {
            const saved = await projectConfigs.upsert({
              projectId,
              privacyUrl,
            });
            applyDurableProjectConfigs(await projectConfigs.list());
            return respond(response, 200, saved);
          } catch {
            return respond(response, 400, { error: 'Neplatná adresa zásad ochrany osobních údajů.' });
          }
        }

        return respond(response, 405, { error: 'Method not allowed.' });
      }
      const publicCompanyContactMatch = path.match(
        /^\/public\/companies\/([^/]+)\/contact$/,
      );
      if (publicCompanyContactMatch !== null && request.method === 'GET') {
        const companyId = decodeURIComponent(
          publicCompanyContactMatch[1] ?? '',
        ).trim();
        const canonicalCompanyId = canonicalCompanyIdForOfficePartner(companyId);
        const registry = getDefaultCompanyRegistry();
        const company = findCompany(registry, canonicalCompanyId);
        const partner = await officePartners.getByCompanyId(canonicalCompanyId);
        if (company === undefined && partner === null) {
          return respond(response, 404, { error: 'Společnost neexistuje.' });
        }
        return respond(
          response,
          200,
          projectPublicCompanyContact({
            companyId: canonicalCompanyId,
            displayName: company?.name ?? partner?.name ?? '',
            partner,
          }),
        );
      }
      if (path === '/office/partners' || path.startsWith('/office/partners/')) {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session = token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }
        if (!canAuthorOfficePartners(session)) {
          return respond(response, 403, {
            error: 'Office Partner není pro tuto relaci povolen.',
          });
        }

        if (request.method === 'GET' && path === '/office/partners') {
          const partners = await officePartners.list();
          const visible = sessionRoles(session).includes('conis-admin')
            ? partners
            : partners.filter((item) =>
                canMutateOfficePartner(session, item.companyId),
              );
          return respond(response, 200, { partners: visible });
        }

        const partnerMatch = path.match(/^\/office\/partners\/([^/]+)$/);
        if (partnerMatch !== null) {
          const partnerId = decodeURIComponent(partnerMatch[1] ?? '').trim();
          if (partnerId.length === 0) {
            return respond(response, 404, { error: 'Partner neexistuje.' });
          }

          if (request.method === 'GET') {
            const current = await officePartners.get(partnerId);
            if (current === null) {
              return respond(response, 404, { error: 'Partner neexistuje.' });
            }
            if (!canMutateOfficePartner(session, current.companyId)) {
              return respond(response, 403, {
                error: 'Partner není pro tuto relaci povolen.',
              });
            }
            return respond(response, 200, current);
          }

          if (request.method === 'PUT') {
            const current = await officePartners.get(partnerId);
            if (current === null) {
              return respond(response, 404, { error: 'Partner neexistuje.' });
            }
            if (!canMutateOfficePartner(session, current.companyId)) {
              return respond(response, 403, {
                error: 'Partner není pro tuto relaci povolen.',
              });
            }
            const draft = officePartnerDraftFromBody(await requestBody(request));
            if (draft === null) {
              return respond(response, 400, { error: 'Neplatný partner.' });
            }
            try {
              const saved = await officePartners.update({
                id: partnerId,
                draft,
              });
              return respond(response, 200, saved);
            } catch (error) {
              if (error instanceof OfficePartnerNotFoundError) {
                return respond(response, 404, { error: 'Partner neexistuje.' });
              }
              if (error instanceof DuplicateOfficePartnerError) {
                return respond(response, 409, {
                  error: 'Partner s touto identitou už existuje.',
                });
              }
              if (error instanceof InvalidOfficePartnerError) {
                return respond(response, 400, { error: error.message });
              }
              throw error;
            }
          }

          return respond(response, 405, { error: 'Method not allowed.' });
        }

        if (request.method === 'POST' && path === '/office/partners') {
          const draft = officePartnerDraftFromBody(await requestBody(request));
          if (draft === null || draft.id === undefined || draft.id.trim().length === 0) {
            return respond(response, 400, { error: 'Neplatný partner.' });
          }
          const companyId = canonicalCompanyIdForOfficePartner(draft.id);
          if (!canMutateOfficePartner(session, companyId)) {
            return respond(response, 403, {
              error: 'Partner není pro tuto relaci povolen.',
            });
          }
          try {
            const created = await officePartners.create({
              id: draft.id,
              draft,
            });
            return respond(response, 201, created);
          } catch (error) {
            if (error instanceof DuplicateOfficePartnerError) {
              return respond(response, 409, {
                error: 'Partner s touto identitou už existuje.',
              });
            }
            if (error instanceof InvalidOfficePartnerError) {
              return respond(response, 400, { error: error.message });
            }
            throw error;
          }
        }

        return respond(response, 405, { error: 'Method not allowed.' });
      }
      if (request.method === 'POST' && path.startsWith('/public/auth/activate/')) {
        const token = decodeURIComponent(path.slice('/public/auth/activate/'.length));
        const body = await requestBody(request) as {
          ndaAccepted?: boolean;
          password?: string;
          rememberMe?: boolean;
        };
        if (body.ndaAccepted !== true) {
          return respond(response, 409, { error: 'Bez souhlasu s NDA není aktivace účtu možná.' });
        }
        if (typeof body.password !== 'string' || body.password.trim().length < 8) {
          return respond(response, 400, { error: 'Heslo musí mít alespoň 8 znaků.' });
        }
        const activation = await repository.activate(token, true);
        if (!activation.ok) return respond(response, 409, activation);
        const issued = await partnerSessions.activate({
          invite: activation.invite,
          password: body.password,
          rememberMe: body.rememberMe !== false,
        });
        setPartnerSessionCookie(response, issued.token, issued.expiresAt);
        return respond(response, 200, { ok: true, session: issued.identity });
      }
      if (request.method === 'POST' && path === '/public/auth/login') {
        const body = await requestBody(request) as {
          email?: string;
          password?: string;
          rememberMe?: boolean;
        };
        if (typeof body.email !== 'string' || typeof body.password !== 'string') {
          return respond(response, 400, { error: 'E-mail a heslo jsou povinné.' });
        }
        const issued = await partnerSessions.login({
          email: body.email,
          password: body.password,
          rememberMe: body.rememberMe !== false,
        });
        if (issued === null) return respond(response, 401, { error: 'Neplatné přihlášení.' });
        setPartnerSessionCookie(response, issued.token, issued.expiresAt);
        return respond(response, 200, { ok: true, session: issued.identity });
      }
      if (request.method === 'GET' && path === '/public/auth/me') {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session = token === null ? null : await partnerSessions.resolve(token);
        return respond(response, session === null ? 401 : 200, session ?? { error: 'Neplatná relace.' });
      }
      const housePackageMatch = path.match(
        /^\/public\/house-packages\/([^/]+)\/(initialize|persist|state)$/,
      );
      const housePackageMediaMatch = path.match(
        /^\/public\/house-packages\/([^/]+)\/media\/(.+)$/,
      );
      if (housePackageMatch !== null || housePackageMediaMatch !== null) {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        const session = token === null ? null : await partnerSessions.resolve(token);
        if (session === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }

        const houseId = decodeURIComponent(
          (housePackageMatch ?? housePackageMediaMatch)![1]!,
        );
        const authorizedHouseIds = new Set([
          session.activeHouseId,
          ...(session.workspaceContext?.authoredHouseIdentities ?? []).map(
            (house) => house.houseId,
          ),
        ]);
        if (!authorizedHouseIds.has(houseId)) {
          return respond(response, 403, {
            error: 'House Package není pro tuto relaci povolen.',
          });
        }

        if (housePackageMediaMatch !== null) {
          const mediaPath = housePackageMediaMatch[2]!;
          if (request.method === 'POST') {
            const contentType = request.headers['content-type'];
            if (typeof contentType !== 'string' || contentType.trim().length === 0) {
              return respond(response, 400, { error: 'Media content-type is required.' });
            }
            await housePackages.writeMedia(houseId, mediaPath, {
              bytes: await requestBytes(request),
              contentType,
            });
            return respond(response, 201, { ok: true, houseId });
          }
          if (request.method === 'GET') {
            const media = await housePackages.readMedia(houseId, mediaPath);
            return media === null
              ? respond(response, 404, { error: 'House Package media neexistuje.' })
              : respondMedia(response, media.contentType, media.bytes);
          }
          if (request.method === 'DELETE') {
            const deleted = await housePackages.deleteMedia(houseId, mediaPath);
            return respond(response, deleted ? 204 : 404, deleted ? {} : {
              error: 'House Package media neexistuje.',
            });
          }
          return respond(response, 405, { error: 'Method not allowed.' });
        }

        const action = housePackageMatch![2]!;
        if (action === 'initialize' && request.method === 'POST') {
          const initialized = await housePackages.initialize(houseId);
          return respond(response, 200, { ok: true, houseId: initialized.houseId });
        }
        if (action === 'persist' && request.method === 'POST') {
          const body = await requestBody(request) as {
            files?: HousePackagePersistFiles;
            packageRoot?: unknown;
          };
          if ('packageRoot' in body) {
            return respond(response, 400, { error: 'packageRoot is server-owned.' });
          }
          if (body.files === null || typeof body.files !== 'object') {
            return respond(response, 400, { error: 'House Package files are required.' });
          }
          const persisted = await housePackages.persist(houseId, body.files);
          return respond(response, 200, {
            ok: true,
            houseId: persisted.houseId,
            updatedAt: persisted.updatedAt,
          });
        }
        if (action === 'state' && request.method === 'GET') {
          const current = await housePackages.get(houseId);
          return respond(
            response,
            current === null ? 404 : 200,
            current ?? { error: 'House Package neexistuje.' },
          );
        }
        return respond(response, 405, { error: 'Method not allowed.' });
      }
      if (request.method === 'POST' && path === '/public/auth/context') {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        if (token === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }

        const current = await partnerSessions.resolve(token);
        if (current === null) {
          return respond(response, 401, { error: 'Neplatná relace.' });
        }

        const mutation = await requestBody(request) as import('./partnerSessionRepository').PartnerSessionContextMutation;
        const session = await partnerSessions.mutateContext(token, mutation);

        if (session === null) {
          return respond(response, 403, {
            error: 'Požadovaný Partner Environment není pro tuto relaci povolen.',
          });
        }

        return respond(response, 200, { ok: true, session });
      }
      if (request.method === 'POST' && path === '/public/auth/logout') {
        const token = requestCookie(request, PARTNER_SESSION_COOKIE);
        if (token !== null) await partnerSessions.revoke(token);
        clearPartnerSessionCookie(response);
        return respond(response, 204, {});
      }
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
