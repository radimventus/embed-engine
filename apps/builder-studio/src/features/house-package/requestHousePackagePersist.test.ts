import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { requestHousePackagePersist } from './requestHousePackagePersist';

describe('requestHousePackagePersist', () => {
  it('sends the selected House Package root with the persist payload', async () => {
    const originalFetch = globalThis.fetch;
    let body = '';
    globalThis.fetch = async (_input, init) => {
      body = String(init?.body ?? '');
      return new Response(JSON.stringify({ ok: true, written: ['manifest.json'] }));
    };

    try {
      const result = await requestHousePackagePersist(
        { manifestJson: '{"heroCopy":{"headline":"VR HERO 22"}}' },
        'apps/client-studio/public/house-packages/bungalov-4kk',
      );

      assert.deepEqual(result, { ok: true, written: ['manifest.json'] });
      assert.deepEqual(JSON.parse(body), {
        files: { manifestJson: '{"heroCopy":{"headline":"VR HERO 22"}}' },
        packageRoot: 'apps/client-studio/public/house-packages/bungalov-4kk',
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
