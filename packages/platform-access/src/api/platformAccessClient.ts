import type { PlatformRole } from '../domain/types';
import type { PlatformSession } from '../domain/types';
import type { PilotInviteStatus } from '../domain/pilotTypes';
import type { PartnerEnvironmentScope } from '../partner/partnerEnvironmentScope';

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
  readonly partnerId: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
};

/**
 * Narrow API boundary for shared invite activation records.
 * Create/reissue are authenticated Office operations; revoke remains local-pilot.
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
  return 'https://api.conis.cz';
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
      const response = await fetch(`${baseUrl}/office/invites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Pozvánku se nepodařilo vytvořit.');
      return parseResponse<PlatformAccessInviteIssue>(response);
    },
    async reissueInvite(id) {
      const response = await fetch(
        `${baseUrl}/office/invites/${encodeURIComponent(id)}/reissue`,
        { method: 'POST', credentials: 'include' },
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

export type PlatformAccessWriteResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export type PlatformAccessCanonicalRegistrySnapshot = {
  readonly tenants: readonly {
    readonly id: string;
    readonly name: string;
    readonly companyId: string;
    readonly pilot: boolean;
    readonly createdAt: string;
  }[];
  readonly companies: readonly {
    readonly id: string;
    readonly name: string;
    readonly tenantId: string;
  }[];
  readonly workspaces: readonly {
    readonly id: string;
    readonly companyId: string;
    readonly name: string;
  }[];
  readonly projects: readonly {
    readonly id: string;
    readonly companyId: string;
    readonly workspaceId: string;
    readonly name: string;
    readonly slug: string;
    readonly description: string;
  }[];
  readonly houses: readonly {
    readonly id: string;
    readonly canonicalProjectId: string;
    readonly name: string;
    readonly packageRoot?: string;
    readonly status?: string;
  }[];
};

export type PlatformAccessCanonicalHouseAuthorityInput = {
  readonly id: string;
  readonly canonicalProjectId: string;
  readonly name: string;
  readonly packageRoot?: string;
  readonly status?: string;
};

export type PlatformAccessCanonicalAuthorityBundle = {
  readonly tenant: {
    readonly id: string;
    readonly name: string;
    readonly companyId: string;
    readonly pilot: boolean;
    readonly createdAt: string;
  };
  readonly company: {
    readonly id: string;
    readonly name: string;
    readonly tenantId: string;
  };
  readonly workspace: {
    readonly id: string;
    readonly companyId: string;
    readonly name: string;
  };
  readonly project: {
    readonly id: string;
    readonly companyId: string;
    readonly workspaceId: string;
    readonly name: string;
    readonly slug: string;
    readonly description: string;
  };
};

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
  mutateSessionContext(input:
    | {
        readonly action: 'enter';
        readonly partnerId: string;
        readonly tenantId: string;
        readonly companyId: string;
        readonly workspaceId: string;
        readonly projectId: string;
        readonly activeHouseId: string | null;
        readonly authoredHouseIdentities?: readonly import('../domain/workspaceContext').WorkspaceAuthoredHouseIdentity[];
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
        readonly authoredHouseIdentities?: readonly import('../domain/workspaceContext').WorkspaceAuthoredHouseIdentity[];
      }
    | { readonly action: 'leave' }
  ): Promise<PlatformAccessAuthResult>;
  readCanonicalRegistry(): Promise<
    | {
        readonly ok: true;
        readonly registry: PlatformAccessCanonicalRegistrySnapshot;
      }
    | {
        readonly ok: false;
        readonly error: string;
      }
  >;
  persistCanonicalProjectAuthority(
    input: PlatformAccessCanonicalAuthorityBundle,
  ): Promise<PlatformAccessWriteResult>;
  persistCanonicalHouseAuthority(
    input: PlatformAccessCanonicalHouseAuthorityInput,
  ): Promise<PlatformAccessWriteResult>;
  persistPartnerEnvironmentScope(
    partnerId: string,
    scope: PartnerEnvironmentScope,
  ): Promise<PlatformAccessWriteResult>;
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
    async mutateSessionContext(input) {
      const response = await fetch(`${baseUrl}/public/auth/context`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await parseResponse<
        { readonly ok: true; readonly session: PlatformSession } |
        { readonly error?: string }
      >(response);
      return response.ok && 'session' in result
        ? result
        : {
            ok: false,
            error: ('error' in result ? result.error : undefined) ??
              'Partner Environment se nepodařilo aktivovat.',
          };
    },
    async readCanonicalRegistry() {
      const response = await fetch(
        `${baseUrl}/public/auth/canonical-registry`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      const payload = await parseResponse<
        | {
            readonly ok: true;
            readonly registry:
              PlatformAccessCanonicalRegistrySnapshot;
          }
        | {
            readonly error?: string;
          }
      >(response);

      if (
        response.ok &&
        typeof payload === 'object' &&
        payload !== null &&
        'registry' in payload
      ) {
        return payload;
      }

      return {
        ok: false,
        error:
          (
            typeof payload === 'object' &&
            payload !== null &&
            'error' in payload
              ? payload.error
              : undefined
          ) ??
          'Canonical registry se nepodařilo načíst.',
      };
    },
    async persistCanonicalProjectAuthority(input) {
      const response = await fetch(
        `${baseUrl}/public/auth/canonical-project-authority`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) {
        const result = await parseResponse<{ readonly error?: string }>(
          response,
        ).catch(() => ({ error: undefined }));
        return {
          ok: false,
          error:
            result.error ??
            'Canonical Project se nepodařilo registrovat.',
        };
      }
      return { ok: true };
    },
    async persistCanonicalHouseAuthority(input) {
      const response = await fetch(
        `${baseUrl}/public/auth/canonical-house-authority`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) {
        const result = await parseResponse<{ readonly error?: string }>(
          response,
        ).catch(() => ({ error: undefined }));
        return {
          ok: false,
          error:
            result.error ??
            'Canonical House se nepodařilo registrovat.',
        };
      }
      return { ok: true };
    },
    async persistPartnerEnvironmentScope(partnerId, scope) {
      const response = await fetch(
        `${baseUrl}/office/partners/${encodeURIComponent(partnerId)}/environment-scope`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(scope),
        },
      );
      if (!response.ok) {
        const result = await parseResponse<{ readonly error?: string }>(response).catch(
          () => ({ error: undefined }),
        );
        return {
          ok: false,
          error:
            result.error ??
            'Partner Environment scope se nepodařilo uložit.',
        };
      }
      return { ok: true };
    },
    async logout() {
      await fetch(`${baseUrl}/public/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    },
  };
}
