import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createPlatformApiServer,
  type CaseProcessingRecord,
  type CaseProcessingRepository,
  type PartnerIdentity,
  type PartnerSessionRepository,
} from './index.ts';

const canonicalScope = {
  companyId: 'company-test',
  projectId: 'project-test',
  houseId: 'house-test',
} as const;

const referenceCaseId = `ref:${canonicalScope.companyId}:${canonicalScope.projectId}:${canonicalScope.houseId}:energy-land`;

describe('Partner REFERENCE case processing API', () => {
  const identity: PartnerIdentity = {
    user: {
      id: 'user-sales',
      email: 'sales@example.test',
      displayName: 'Sales',
      roles: ['salesman'],
      status: 'active',
      lastLoginAt: '2026-08-20T08:00:00.000Z',
      lastActivityAt: '2026-08-20T08:00:00.000Z',
      lastStudioId: null,
    },
    tenantId: 'tenant-test',
    companyId: canonicalScope.companyId,
    workspaceId: 'workspace-test',
    projectId: canonicalScope.projectId,
    activeHouseId: canonicalScope.houseId,
    activeStudioId: 'sales',
    workspaceContext: null,
    rememberMe: true,
    issuedAt: '2026-08-20T08:00:00.000Z',
    expiresAt: '2026-09-20T08:00:00.000Z',
    lastLoginAt: '2026-08-20T08:00:00.000Z',
  };

  const sessions: PartnerSessionRepository = {
    activate: async () => {
      throw new Error('unused');
    },
    login: async () => null,
    resolve: async (token) => (token === 'sales-token' ? identity : null),
    mutateContext: async () => null,
    revoke: async () => undefined,
  };

  async function withServer(
    repository: CaseProcessingRepository,
    run: (baseUrl: string) => Promise<void>,
  ): Promise<void> {
    const server = createPlatformApiServer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      sessions,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      repository,
    );
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      await run(`http://127.0.0.1:${address.port}`);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) =>
          error === undefined ? resolve() : reject(error),
        );
      });
    }
  }

  it('accepts a REFERENCE case and reads it back without touching Leads', async () => {
    const stored: CaseProcessingRecord[] = [];
    const repository: CaseProcessingRepository = {
      list: async (query) =>
        stored.filter(
          (item) =>
            item.companyId === query.companyId &&
            item.projectId === query.projectId &&
            (query.houseId === undefined || item.houseId === query.houseId),
        ),
      accept: async (input) => {
        if (
          input.caseId !== referenceCaseId ||
          input.houseId !== canonicalScope.houseId
        ) {
          throw new Error('scope');
        }
        const accepted: CaseProcessingRecord = {
          ...input,
          processingStatus: 'accepted',
        };
        stored[0] = accepted;
        return accepted;
      },
    };

    await withServer(repository, async (baseUrl) => {
      const unauthorized = await fetch(
        `${baseUrl}/partner/case-processing/accept`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            caseId: referenceCaseId,
            ...canonicalScope,
          }),
        },
      );
      assert.equal(unauthorized.status, 401);

      const accepted = await fetch(`${baseUrl}/partner/case-processing/accept`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: '__Host-conis_partner_session=sales-token',
        },
        body: JSON.stringify({
          caseId: referenceCaseId,
          ...canonicalScope,
        }),
      });
      assert.equal(accepted.status, 200);
      const body = (await accepted.json()) as {
        readonly caseId: string;
        readonly processingStatus: string;
      };
      assert.equal(body.caseId, referenceCaseId);
      assert.equal(body.processingStatus, 'accepted');

      const listed = await fetch(
        `${baseUrl}/partner/case-processing?companyId=${canonicalScope.companyId}&projectId=${canonicalScope.projectId}&houseId=${canonicalScope.houseId}`,
        { headers: { cookie: '__Host-conis_partner_session=sales-token' } },
      );
      assert.equal(listed.status, 200);
      const listedBody = (await listed.json()) as {
        readonly cases: readonly { readonly processingStatus: string }[];
      };
      assert.equal(listedBody.cases[0]?.processingStatus, 'accepted');
    });
  });
});
