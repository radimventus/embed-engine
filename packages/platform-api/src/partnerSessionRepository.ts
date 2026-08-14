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

const scrypt = promisify(scryptCallback);
const SESSION_VALIDITY_MS = 30 * 24 * 60 * 60 * 1_000;
const DSE_PARTNER_SCOPE = {
  tenantId: 'tenant-domy-s-energii',
  companyId: 'company-domy-s-energii',
  workspaceId: 'domy-s-energii-main',
  projectId: 'project-domy-s-energii',
  partnerId: 'p-dse',
  activeHouseId:
    'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
} as const;

type PartnerWorkspaceContext = {
  readonly operatorMode: true;
  readonly partnerId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly activeHouseId: string | null;
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
      readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
      readonly officeReturnHref: string;
    }
  | {
      readonly action: 'switch';
      readonly activeStudio: 'client' | 'builder' | 'manager' | 'sales';
    }
  | { readonly action: 'leave' };

export type PartnerIdentity = {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly roles: readonly string[];
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
  readonly roles: readonly string[];
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
  activate(input: {
    readonly invite: {
      readonly id: string;
      readonly email: string;
      readonly displayName: string;
      readonly roles: readonly string[];
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

  constructor(statePath = defaultStatePath()) {
    this.statePath = statePath;
  }

  async activate(input: Parameters<PartnerSessionRepository['activate']>[0]): Promise<IssuedPartnerSession> {
    const password = input.password.trim();
    if (password.length < 8) {
      throw new Error('Heslo musí mít alespoň 8 znaků.');
    }
    return this.exclusively(async () => {
      const state = await this.read();
      const email = input.invite.email.trim().toLowerCase();
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
      const accounts = state.accounts.filter((item) => item.email !== email);
      const issued = this.issue(account, input.rememberMe, now);
      await this.write({
        accounts: [...accounts, account],
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

      if (!account.roles.includes('conis-admin')) {
        return null;
      }

      let next: StoredSession;

      if (mutation.action === 'enter') {
        const validScope =
          mutation.partnerId === DSE_PARTNER_SCOPE.partnerId &&
          mutation.tenantId === DSE_PARTNER_SCOPE.tenantId &&
          mutation.companyId === DSE_PARTNER_SCOPE.companyId &&
          mutation.workspaceId === DSE_PARTNER_SCOPE.workspaceId &&
          mutation.projectId === DSE_PARTNER_SCOPE.projectId;

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
        const activeHouseId = DSE_PARTNER_SCOPE.activeHouseId;

        const workspaceContext: PartnerWorkspaceContext = {
          operatorMode: true,
          partnerId: DSE_PARTNER_SCOPE.partnerId,
          companyId: DSE_PARTNER_SCOPE.companyId,
          workspaceId: DSE_PARTNER_SCOPE.workspaceId,
          projectId: DSE_PARTNER_SCOPE.projectId,
          activeHouseId,
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
          tenantId: DSE_PARTNER_SCOPE.tenantId,
          companyId: DSE_PARTNER_SCOPE.companyId,
          workspaceId: DSE_PARTNER_SCOPE.workspaceId,
          projectId: DSE_PARTNER_SCOPE.projectId,
          activeHouseId,
          activeStudioId: mutation.activeStudio,
          workspaceContext,
        };
      } else if (mutation.action === 'switch') {
        if (current.workspaceContext == null) return null;

        next = {
          ...current,
          activeStudioId: mutation.activeStudio,
          workspaceContext: {
            ...current.workspaceContext,
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
