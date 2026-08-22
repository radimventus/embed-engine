import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createPlatformAccessAuthClient,
} from './api/platformAccessClient';

test(
  'TASK-66VR-FIX-05 — reads shared canonical registry',
  async () => {
    const originalFetch =
      globalThis.fetch;

    const requests: Array<{
      readonly url: string;
      readonly init?: RequestInit;
    }> = [];

    try {
      globalThis.fetch =
        (async (input, init) => {
          requests.push({
            url: String(input),
            init,
          });

          return new Response(
            JSON.stringify({
              ok: true,
              registry: {
                tenants: [],
                companies: [],
                workspaces: [],
                projects: [
                  {
                    id:
                      'project-client-fix05',
                    companyId:
                      'company-client-fix05',
                    workspaceId:
                      'workspace-client-fix05',
                    name:
                      'Client Fix05',
                    slug:
                      'client-fix05',
                    description: '',
                  },
                ],
              },
            }),
            {
              status: 200,
              headers: {
                'content-type':
                  'application/json',
              },
            },
          );
        }) as typeof fetch;

      const result =
        await createPlatformAccessAuthClient(
          'https://api.conis.cz',
        ).readCanonicalRegistry();

      assert.equal(
        result.ok,
        true,
      );

      if (!result.ok) return;

      assert.equal(
        result.registry
          .projects[0]?.id,
        'project-client-fix05',
      );

      assert.equal(
        requests.length,
        1,
      );

      assert.equal(
        requests[0]?.url,
        'https://api.conis.cz/public/auth/canonical-registry',
      );

      assert.equal(
        requests[0]?.init?.method,
        'GET',
      );

      assert.equal(
        requests[0]?.init?.credentials,
        'include',
      );
    } finally {
      globalThis.fetch =
        originalFetch;
    }
  },
);
