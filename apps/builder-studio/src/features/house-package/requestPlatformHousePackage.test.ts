import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  platformHousePackageMediaUrl,
  requestPlatformHousePackageMediaUpload,
} from './requestPlatformHousePackage';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('requestPlatformHousePackageMediaUpload', () => {
  it('uploads binary media through the authenticated, house-scoped Platform endpoint', async () => {
    let request: Request | null = null;
    globalThis.fetch = async (input, init) => {
      request = new Request(input, init);
      return new Response(JSON.stringify({ ok: true, houseId: 'house-a' }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    };

    const result = await requestPlatformHousePackageMediaUpload({
      houseId: 'house-a',
      relativePath: 'media/gallery/living-room.png',
      file: {
        type: 'image/png',
      } as File,
    });

    assert.deepEqual(result, {
      ok: true,
      media: {
        relativePath: 'media/gallery/living-room.png',
        url: 'https://api.conis.cz/public/house-packages/house-a/media/media/gallery/living-room.png',
      },
    });
    assert.equal(request?.method, 'POST');
    assert.equal(request?.credentials, 'include');
    assert.equal(request?.headers.get('content-type'), 'image/png');
  });

  it('returns a stable encoded media reference', () => {
    assert.equal(
      platformHousePackageMediaUrl('house/a', 'media/gallery/naše foto.png'),
      'https://api.conis.cz/public/house-packages/house%2Fa/media/media/gallery/na%C5%A1e%20foto.png',
    );
  });
});
