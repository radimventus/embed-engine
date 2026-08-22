import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { promisify } from 'node:util';

import { platformApiStatePath } from './platformApiConfig';
import {
  canAccessStudio,
  type PlatformRole,
} from '@embed-engine/platform-access/rbac';
import {
  getDefaultCompanyRegistry,
  houseIdentityBelongsToAuthorizedProject,
  partnerEnvironmentScopesMatch,
  type AuthoritativePartnerEnvironmentScope,
} from '@embed-engine/platform-access';

const scrypt = promisify(scryptCallback);
const SESSION_VALIDITY_MS = 30 * 24 * 60 * 60 * 1_000;

export const PARTNER_ACCOUNT_COLLISION_MESSAGE =
  'Pro tento e-mail již existuje účet CONIS.';

export class PartnerAccountCollisionError extends Error {
  constructor(message = PARTNER_ACCOUNT_COLLISION_MESSAGE) {
    super(message);
    this.name = 'PartnerAccountCollisionError';
  }
}

export type PartnerAccountSummary = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly createdAt: string;
  readonly lastLoginAt: string;
};

function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toAccountSummary(account: StoredAccount): PartnerAccountSummary {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    roles: account.roles,
    tenantId: account.tenantId,
    companyId: account.companyId,
    workspaceId: account.workspaceId,
    projectId: account.projectId,
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
  };
}
function canonicalHouseIdsForProject(projectId: string): ReadonlySet<string> {
  return new Set(
    getDefaultCompanyRegistry()
      .projects.filter((house) => house.canonicalProjectId === projectId)
      .map((house) => house.id),
  );
}

export type PartnerEnvironmentScopeResolver = {
  (
    partnerId: string,
  ): Promise<AuthoritativePartnerEnvironmentScope | null>;
  byProject?: (
    projectId: string,
  ) => Promise<AuthoritativePartnerEnvironmentScope | null>;
};

type PartnerAuthoredHouseIdentity = {
  readonly houseId: string;
  readonly name: string;
  readonly canonicalProjectId: string;
  readonly packageRoot: string;
  readonly dataMode: 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';
  readonly status: 'draft';
};

type PartnerWorkspaceContext = {
  readonly operatorMode: true;
  readonly partnerId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly activeHouseId: string | null;
  readonly authoredHouseIdentities?: readonly PartnerAuthoredHouseIdentity[];
  readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
  readonly officeReturnHref: string;
  readonly previous: {
    readonly tenantId: string;
    readonly companyId: string;
    readonly workspaceId: string;
    readonly projectId: string | null;
  };
};

export type PartnerSessionContextMutation =
  | {
      readonly action: 'enter';
      readonly partnerId: string;
      readonly tenantId: string;
      readonly companyId: string;
      readonly workspaceId: string;
      readonly projectId: string;
      readonly activeHouseId: string | null;
      readonly authoredHouseIdentities?: readonly PartnerAuthoredHouseIdentity[];
      readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
      readonly officeReturnHref: string;
    }
  | {
      readonly action: 'switch';
      readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
      readonly tenantId?: string;
      readonly companyId?: string;
      readonly workspaceId?: string;
      readonly projectId?: string;
      readonly activeHouseId?: string | null;
      readonly authoredHouseIdentities?: readonly PartnerAuthoredHouseIdentity[];
    }
  | { readonly action: 'leave' };

export type PartnerIdentity = {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly roles: readonly PlatformRole[];
    readonly status: 'active';
    readonly lastLoginAt: string;
    readonly lastActivityAt: string;
    readonly lastStudioId: null;
  };
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly activeHouseId: string | null;
  readonly activeStudioId: 'client' | 'office' | 'builder' | 'manager' | 'sales' | null;
  readonly workspaceContext: PartnerWorkspaceContext | null;
  readonly rememberMe: boolean;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly lastLoginAt: string;
};

type StoredAccount = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly passwordHash: string;
  readonly passwordSalt: string;
  readonly createdAt: string;
  readonly lastLoginAt: string;
};

type StoredSession = {
  readonly id: string;
  readonly verifier: string;
  readonly accountId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly rememberMe: boolean;
  readonly revokedAt: string | null;
  readonly tenantId?: string;
  readonly companyId?: string;
  readonly workspaceId?: string;
  readonly projectId?: string;
  readonly activeHouseId?: string | null;
  readonly activeStudioId?: PartnerIdentity['activeStudioId'];
  readonly workspaceContext?: PartnerWorkspaceContext | null;
};

type PartnerSessionState = {
  readonly accounts: readonly StoredAccount[];
  readonly sessions: readonly StoredSession[];
};

export type IssuedPartnerSession = {
  readonly token: string;
  readonly identity: PartnerIdentity;
  readonly expiresAt: string;
};

export interface PartnerSessionRepository {
  findAccountByEmail(email: string): Promise<PartnerAccountSummary | null>;
  activate(input: {
    readonly invite: {
      readonly id: string;
      readonly email: string;
      readonly displayName: string;
      readonly roles: readonly PlatformRole[];
      readonly tenantId: string;
      readonly companyId: string;
      readonly workspaceId: string;
      readonly projectId: string;
    };
    readonly password: string;
    readonly rememberMe: boolean;
  }): Promise<IssuedPartnerSession>;
  login(input: {
    readonly email: string;
    readonly password: string;
    readonly rememberMe: boolean;
  }): Promise<IssuedPartnerSession | null>;
  resolve(token: string): Promise<PartnerIdentity | null>;
  mutateContext(
    token: string,
    mutation: PartnerSessionContextMutation,
  ): Promise<PartnerIdentity | null>;
  revoke(token: string): Promise<void>;
}

function tokenVerifier(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function issueToken(): string {
  return randomBytes(32).toString('base64url');
}

function defaultStatePath(): string {
  return platformApiStatePath('partner-sessions.json');
}

function identity(
  account: StoredAccount,
  session: Pick<
    StoredSession,
    | 'issuedAt'
    | 'expiresAt'
    | 'rememberMe'
    | 'tenantId'
    | 'companyId'
    | 'workspaceId'
    | 'projectId'
    | 'activeHouseId'
    | 'activeStudioId'
    | 'workspaceContext'
  >,
): PartnerIdentity {
  return {
    user: {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      roles: account.roles,
      status: 'active',
      lastLoginAt: account.lastLoginAt,
      lastActivityAt: account.lastLoginAt,
      lastStudioId: null,
    },
    tenantId: session.tenantId ?? account.tenantId,
    companyId: session.companyId ?? account.companyId,
    workspaceId: session.workspaceId ?? account.workspaceId,
    projectId: session.projectId ?? account.projectId,
    activeHouseId: session.activeHouseId ?? null,
    activeStudioId: session.activeStudioId ?? null,
    workspaceContext: session.workspaceContext ?? null,
    rememberMe: session.rememberMe,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
    lastLoginAt: account.lastLoginAt,
  };
}

export class FilePartnerSessionRepository implements PartnerSessionRepository {
  readonly statePath: string;
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    statePath = defaultStatePath(),
    private readonly resolvePartnerEnvironmentScope: PartnerEnvironmentScopeResolver = async () =>
      null,
  ) {
    this.statePath = statePath;
  }

  async findAccountByEmail(email: string): Promise<PartnerAccountSummary | null> {
    const normalized = normalizeAccountEmail(email);
    if (normalized.length === 0) return null;
    const account = (await this.read()).accounts.find(
      (item) => item.email === normalized,
    );
    return account === undefined ? null : toAccountSummary(account);
  }

  async activate(input: Parameters<PartnerSessionRepository['activate']>[0]): Promise<IssuedPartnerSession> {
    const password = input.password.trim();
    if (password.length < 8) {
      throw new Error('Heslo musí mít alespoň 8 znaků.');
    }
    return this.exclusively(async () => {
      const state = await this.read();
      const email = normalizeAccountEmail(input.invite.email);
      if (
        state.accounts.some((item) => item.email === email)
      ) {
        throw new PartnerAccountCollisionError();
      }
      const now = new Date().toISOString();
      const passwordSalt = randomBytes(16).toString('base64url');
      const passwordHash = await this.hashPassword(password, passwordSalt);
      const account: StoredAccount = {
        id: `user-invite-${input.invite.id}`,
        email,
        displayName: input.invite.displayName,
        roles: [...input.invite.roles],
        tenantId: input.invite.tenantId,
        companyId: input.invite.companyId,
        workspaceId: input.invite.workspaceId,
        projectId: input.invite.projectId,
        passwordHash,
        passwordSalt,
        createdAt: now,
        lastLoginAt: now,
      };
      const issued = this.issue(account, input.rememberMe, now);
      await this.write({
        accounts: [...state.accounts, account],
        sessions: [...state.sessions, issued.session],
      });
      return {
        token: issued.token,
        identity: identity(account, issued.session),
        expiresAt: issued.session.expiresAt,
      };
    });
  }

  async login(input: Parameters<PartnerSessionRepository['login']>[0]): Promise<IssuedPartnerSession | null> {
    return this.exclusively(async () => {
      const state = await this.read();
      const account = state.accounts.find(
        (item) => item.email === input.email.trim().toLowerCase(),
      );
      if (account === undefined || !await this.verifyPassword(input.password, account)) {
        return null;
      }
      const now = new Date().toISOString();
      const refreshed = { ...account, lastLoginAt: now };
      const issued = this.issue(refreshed, input.rememberMe, now);
      await this.write({
        accounts: state.accounts.map((item) => item.id === account.id ? refreshed : item),
        sessions: [...state.sessions, issued.session],
      });
      return {
        token: issued.token,
        identity: identity(refreshed, issued.session),
        expiresAt: issued.session.expiresAt,
      };
    });
  }

  async resolve(token: string): Promise<PartnerIdentity | null> {
    const state = await this.read();
    const session = state.sessions.find(
      (item) =>
        item.verifier === tokenVerifier(token) &&
        item.revokedAt === null &&
        Date.parse(item.expiresAt) > Date.now(),
    );
    if (session === undefined) return null;
    const account = state.accounts.find((item) => item.id === session.accountId);
    return account === undefined ? null : identity(account, session);
  }

  async mutateContext(
    token: string,
    mutation: PartnerSessionContextMutation,
  ): Promise<PartnerIdentity | null> {
    return this.exclusively(async () => {
      const state = await this.read();
      const verifier = tokenVerifier(token);
      const sessionIndex = state.sessions.findIndex(
        (item) =>
          item.verifier === verifier &&
          item.revokedAt === null &&
          Date.parse(item.expiresAt) > Date.now(),
      );
      if (sessionIndex < 0) return null;

      const current = state.sessions[sessionIndex]!;
      const account = state.accounts.find(
        (item) => item.id === current.accountId,
      );
      if (account === undefined) return null;

      const isConisAdmin = account.roles.includes('conis-admin');

      // TASK-42T — entering/leaving an operator Partner Environment remains
      // a CONIS-admin capability. A normal partner session may only switch
      // Studio inside its own already-authorized canonical scope.
      if (mutation.action !== 'switch' && !isConisAdmin) {
        return null;
      }

      let next: StoredSession;

      if (mutation.action === 'enter') {
        const authoritativeScope = await this.resolvePartnerEnvironmentScope(
          mutation.partnerId,
        );
        if (authoritativeScope === null) return null;

        const validScope = partnerEnvironmentScopesMatch(
          {
            partnerId: mutation.partnerId,
            tenantId: mutation.tenantId,
            companyId: mutation.companyId,
            workspaceId: mutation.workspaceId,
            projectId: mutation.projectId,
          },
          authoritativeScope,
        );

        if (!validScope) return null;

        let officeReturnHref: string;
        try {
          const url = new URL(mutation.officeReturnHref);
          const productionOffice =
            url.protocol === 'https:' &&
            url.hostname === 'conis.cz' &&
            url.port === '' &&
            url.pathname.startsWith('/studio/office/');
          const localQaOffice =
            url.protocol === 'https:' &&
            url.hostname === 'conis.cz' &&
            url.port === '4181';

          if (!productionOffice && !localQaOffice) return null;
          officeReturnHref = url.toString();
        } catch {
          return null;
        }

        const previous = identity(account, current);
        const authoredHouseIdentities =
          mutation.authoredHouseIdentities?.filter(
            (house) =>
              house.houseId.trim().length > 0 &&
              house.name.trim().length > 0 &&
              house.packageRoot.trim().length > 0 &&
              house.canonicalProjectId === authoritativeScope.projectId &&
              house.status === 'draft',
          ) ?? [];

        const requestedHouseId = mutation.activeHouseId?.trim() || null;
        const validHouseIds = canonicalHouseIdsForProject(
          authoritativeScope.projectId,
        );
        const activeHouseId =
          requestedHouseId !== null &&
          (
            validHouseIds.has(requestedHouseId) ||
            authoredHouseIdentities.some(
              (house) => house.houseId === requestedHouseId,
            )
          )
            ? requestedHouseId
            : null;

        const workspaceContext: PartnerWorkspaceContext = {
          operatorMode: true,
          partnerId: authoritativeScope.partnerId,
          companyId: authoritativeScope.companyId,
          workspaceId: authoritativeScope.workspaceId,
          projectId: authoritativeScope.projectId,
          activeHouseId,
          authoredHouseIdentities,
          activeStudio: mutation.activeStudio,
          officeReturnHref,
          previous: {
            tenantId: previous.tenantId,
            companyId: previous.companyId,
            workspaceId: previous.workspaceId,
            projectId: previous.projectId,
          },
        };

        next = {
          ...current,
          tenantId: authoritativeScope.tenantId,
          companyId: authoritativeScope.companyId,
          workspaceId: authoritativeScope.workspaceId,
          projectId: authoritativeScope.projectId,
          activeHouseId,
          activeStudioId: mutation.activeStudio,
          workspaceContext,
        };
      } else if (mutation.action === 'switch') {
        // A normal Partner remains bound to its authenticated Partner
        // Environment. A CONIS Admin may intentionally switch to another
        // authoritative Partner Environment registered by Office.
        const currentAuthorizedScope = {
          tenantId: current.tenantId ?? account.tenantId,
          companyId: current.companyId ?? account.companyId,
          workspaceId: current.workspaceId ?? account.workspaceId,
          projectId: current.projectId ?? account.projectId,
        };

        const requestedProjectId =
          mutation.projectId?.trim() || currentAuthorizedScope.projectId;

        let authorizedScope = currentAuthorizedScope;
        let targetPartnerId =
          current.workspaceContext?.partnerId ?? currentAuthorizedScope.companyId;

        if (isConisAdmin && requestedProjectId !== currentAuthorizedScope.projectId) {
          const targetScope =
            await this.resolvePartnerEnvironmentScope.byProject?.(
              requestedProjectId,
            );

          if (targetScope == null) return null;

          authorizedScope = {
            tenantId: targetScope.tenantId,
            companyId: targetScope.companyId,
            workspaceId: targetScope.workspaceId,
            projectId: targetScope.projectId,
          };
          targetPartnerId = targetScope.partnerId;
        }

        if (
          !isConisAdmin &&
          requestedProjectId !== currentAuthorizedScope.projectId
        ) {
          return null;
        }

        if (
          mutation.tenantId !== undefined &&
          mutation.tenantId !== authorizedScope.tenantId
        ) {
          return null;
        }
        if (
          mutation.companyId !== undefined &&
          mutation.companyId !== authorizedScope.companyId
        ) {
          return null;
        }
        if (
          mutation.workspaceId !== undefined &&
          mutation.workspaceId !== authorizedScope.workspaceId
        ) {
          return null;
        }

        if (!isConisAdmin) {
          if (!canAccessStudio(account.roles, mutation.activeStudio)) {
            return null;
          }

          if (
            authorizedScope.tenantId !== account.tenantId ||
            authorizedScope.companyId !== account.companyId ||
            authorizedScope.workspaceId !== account.workspaceId ||
            authorizedScope.projectId !== account.projectId
          ) {
            return null;
          }
        }

        const context: PartnerWorkspaceContext =
          current.workspaceContext ?? {
            operatorMode: true,
            partnerId: targetPartnerId,
            companyId: authorizedScope.companyId,
            workspaceId: authorizedScope.workspaceId,
            projectId: authorizedScope.projectId,
            activeHouseId: current.activeHouseId ?? null,
            activeStudio: mutation.activeStudio,
            officeReturnHref: '',
            previous: {
              tenantId: account.tenantId,
              companyId: account.companyId,
              workspaceId: account.workspaceId,
              projectId: account.projectId,
            },
          };

        const authoredHouseIdentities =
          mutation.authoredHouseIdentities?.filter(
            (house) =>
              house.houseId.trim().length > 0 &&
              house.name.trim().length > 0 &&
              house.canonicalProjectId === authorizedScope.projectId &&
              house.status === 'draft',
          ) ??
          context.authoredHouseIdentities?.filter(
            (house) => house.canonicalProjectId === authorizedScope.projectId,
          ) ??
          [];

        const requestedHouseId: string | null =
          mutation.activeHouseId === undefined
            ? current.activeHouseId ?? null
            : mutation.activeHouseId?.trim() || null;

        const activeHouseId =
          requestedHouseId !== null &&
          (
            houseIdentityBelongsToAuthorizedProject(requestedHouseId, {
              companyId: authorizedScope.companyId,
              projectId: authorizedScope.projectId,
            }) ||
            authoredHouseIdentities.some(
              (house) => house.houseId === requestedHouseId,
            )
          )
            ? requestedHouseId
            : null;

        next = {
          ...current,
          tenantId: authorizedScope.tenantId,
          companyId: authorizedScope.companyId,
          workspaceId: authorizedScope.workspaceId,
          projectId: authorizedScope.projectId,
          activeHouseId,
          activeStudioId: mutation.activeStudio,
          workspaceContext: {
            ...context,
            partnerId: targetPartnerId,
            companyId: authorizedScope.companyId,
            workspaceId: authorizedScope.workspaceId,
            projectId: authorizedScope.projectId,
            activeHouseId,
            authoredHouseIdentities,
            activeStudio: mutation.activeStudio,
          },
        };
      } else {
        const context = current.workspaceContext;
        if (context == null) return null;

        next = {
          ...current,
          tenantId: context.previous.tenantId,
          companyId: context.previous.companyId,
          workspaceId: context.previous.workspaceId,
          projectId: context.previous.projectId ?? account.projectId,
          activeHouseId: null,
          activeStudioId: 'office',
          workspaceContext: null,
        };
      }

      const sessions = [...state.sessions];
      sessions[sessionIndex] = next;
      await this.write({ ...state, sessions });

      return identity(account, next);
    });
  }

  async revoke(token: string): Promise<void> {
    await this.exclusively(async () => {
      const state = await this.read();
      const verifier = tokenVerifier(token);
      const now = new Date().toISOString();
      await this.write({
        ...state,
        sessions: state.sessions.map((item) =>
          item.verifier === verifier && item.revokedAt === null
            ? { ...item, revokedAt: now }
            : item,
        ),
      });
    });
  }

  private issue(account: StoredAccount, rememberMe: boolean, now: string): {
    readonly token: string;
    readonly session: StoredSession;
  } {
    const token = issueToken();
    return {
      token,
      session: {
        id: `session-${randomBytes(12).toString('base64url')}`,
        verifier: tokenVerifier(token),
        accountId: account.id,
        issuedAt: now,
        expiresAt: new Date(Date.parse(now) + SESSION_VALIDITY_MS).toISOString(),
        rememberMe,
        revokedAt: null,
      },
    };
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return (await scrypt(password, salt, 64) as Buffer).toString('base64url');
  }

  private async verifyPassword(password: string, account: StoredAccount): Promise<boolean> {
    const actual = Buffer.from(await this.hashPassword(password, account.passwordSalt), 'base64url');
    const expected = Buffer.from(account.passwordHash, 'base64url');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private async read(): Promise<PartnerSessionState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as Partial<PartnerSessionState>;
      return {
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { accounts: [], sessions: [] };
      }
      throw error;
    }
  }

  private async write(state: PartnerSessionState): Promise<void> {
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
