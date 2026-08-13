import type { PlatformRole } from '../domain/types';
import type { PlatformSession } from '../domain/types';
import type { PilotInviteStatus } from '../domain/pilotTypes';

export type PlatformAccessInvite = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly status: PilotInviteStatus;
  readonly createdAt: string;
  readonly activatedAt: string | null;
  readonly ndaAcceptedAt: string | null;
  readonly expiresAt: string;
};

export type PlatformAccessInviteActivation =
  | { readonly ok: true; readonly invite: PlatformAccessInvite }
  | { readonly ok: false; readonly error: string };

export type PlatformAccessInviteIssue = PlatformAccessInvite & {
  /** Returned only by local-pilot create or reissue responses. */
  readonly token: string;
};

export type PlatformAccessInviteCreateInput = {
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

/**
 * Narrow API boundary for shared invite activation records.
 * Create/reissue/revoke are accepted only by the loopback local-pilot process;
 * resolve/activate are the public partner operations.
 */
export interface PlatformAccessInviteClient {
  createInvite(
    input: PlatformAccessInviteCreateInput,
  ): Promise<PlatformAccessInviteIssue>;
  reissueInvite(id: string): Promise<PlatformAccessInviteIssue | null>;
  revokeInvite(id: string): Promise<PlatformAccessInvite | null>;
  resolveInvite(token: string): Promise<PlatformAccessInvite | null>;
  activateInvite(
    token: string,
    ndaAccepted: boolean,
  ): Promise<PlatformAccessInviteActivation>;
}

export function platformApiOrigin(): string {
  const env = (import.meta as ImportMeta & {
    env?: Record<string, string | boolean | undefined>;
  }).env;
  const configuredOrigin = env?.VITE_PLATFORM_API_ORIGIN;
  if (typeof configuredOrigin === 'string' && configuredOrigin.length > 0) {
    return configuredOrigin;
  }
  return env?.PROD === true ? 'https://api.conis.cz' : 'http://127.0.0.1:4310';
}

async function parseResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function createPlatformAccessInviteClient(
  origin = platformApiOrigin(),
): PlatformAccessInviteClient {
  const baseUrl = origin.replace(/\/$/, '');
  return {
    async createInvite(input) {
      const response = await fetch(`${baseUrl}/local-pilot/invites`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Pozvánku se nepodařilo vytvořit.');
      return parseResponse<PlatformAccessInviteIssue>(response);
    },
    async reissueInvite(id) {
      const response = await fetch(
        `${baseUrl}/local-pilot/invites/${encodeURIComponent(id)}/reissue`,
        { method: 'POST' },
      );
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Pozvánku se nepodařilo obnovit.');
      return parseResponse<PlatformAccessInviteIssue>(response);
    },
    async revokeInvite(id) {
      const response = await fetch(
        `${baseUrl}/local-pilot/invites/${encodeURIComponent(id)}/revoke`,
        { method: 'POST' },
      );
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Pozvánku se nepodařilo zrušit.');
      return parseResponse<PlatformAccessInvite>(response);
    },
    async resolveInvite(token) {
      const response = await fetch(
        `${baseUrl}/public/invites/${encodeURIComponent(token)}`,
      );
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Pozvánku se nepodařilo ověřit.');
      return parseResponse<PlatformAccessInvite>(response);
    },
    async activateInvite(token, ndaAccepted) {
      const response = await fetch(
        `${baseUrl}/public/invites/${encodeURIComponent(token)}/activate`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ndaAccepted }),
        },
      );
      return parseResponse<PlatformAccessInviteActivation>(response);
    },
  };
}

export type PlatformAccessAuthResult =
  | { readonly ok: true; readonly session: PlatformSession }
  | { readonly ok: false; readonly error: string };

export interface PlatformAccessAuthClient {
  activateInvite(input: {
    readonly token: string;
    readonly password: string;
    readonly rememberMe: boolean;
  }): Promise<PlatformAccessAuthResult>;
  login(input: {
    readonly email: string;
    readonly password: string;
    readonly rememberMe: boolean;
  }): Promise<PlatformAccessAuthResult>;
  restoreSession(): Promise<PlatformSession | null>;
  logout(): Promise<void>;
}

export function createPlatformAccessAuthClient(
  origin = platformApiOrigin(),
): PlatformAccessAuthClient {
  const baseUrl = origin.replace(/\/$/, '');
  async function postAuthentication(
    path: string,
    body: unknown,
  ): Promise<PlatformAccessAuthResult> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await parseResponse<
      { readonly ok: true; readonly session: PlatformSession } | { readonly error?: string }
    >(response);
    return response.ok && 'session' in result
      ? result
      : {
          ok: false,
          error: ('error' in result ? result.error : undefined) ??
            'Přihlášení se nepodařilo dokončit.',
        };
  }
  return {
    activateInvite(input) {
      return postAuthentication(
        `/public/auth/activate/${encodeURIComponent(input.token)}`,
        {
          ndaAccepted: true,
          password: input.password,
          rememberMe: input.rememberMe,
        },
      );
    },
    login(input) {
      return postAuthentication('/public/auth/login', input);
    },
    async restoreSession() {
      const response = await fetch(`${baseUrl}/public/auth/me`, {
        credentials: 'include',
      });
      return response.ok ? parseResponse<PlatformSession>(response) : null;
    },
    async logout() {
      await fetch(`${baseUrl}/public/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    },
  };
}
