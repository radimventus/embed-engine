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
  readonly activeHouseId: null;
  readonly activeStudioId: null;
  readonly workspaceContext: null;
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
  session: Pick<StoredSession, 'issuedAt' | 'expiresAt' | 'rememberMe'>,
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
    tenantId: account.tenantId,
    companyId: account.companyId,
    workspaceId: account.workspaceId,
    projectId: account.projectId,
    activeHouseId: null,
    activeStudioId: null,
    workspaceContext: null,
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
