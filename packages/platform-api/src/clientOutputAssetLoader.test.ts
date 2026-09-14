import assert from 'node:assert/strict';
import test from 'node:test';
import { loadClientOutputAsset, resolveClientOutputAssetUrl } from './clientOutputAssetLoader';

test('resolves root-relative House media against the public production asset origin', () => {
  assert.equal(
    resolveClientOutputAssetUrl('/house-packages/example/media/hero.webp', {}).href,
    'https://conis.cz/house-packages/example/media/hero.webp',
  );
  assert.equal(
    resolveClientOutputAssetUrl('/media/hero.webp', { CLIENT_OUTPUT_ASSET_ORIGIN: 'https://assets.example.test/root/' }).href,
    'https://assets.example.test/media/hero.webp',
  );
});

test('rejects an asset outside the configured public origin', () => {
  assert.throws(
    () => resolveClientOutputAssetUrl('http://127.0.0.1/private', {}),
    /origin is not allowed/,
  );
});

test('loads the actual resolved asset bytes used by PDF generation', async () => {
  let requested = '';
  const bytes = await loadClientOutputAsset('/house-packages/h/media/plan.png', async (input) => {
    requested = String(input);
    return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
  }, {});
  assert.equal(requested, 'https://conis.cz/house-packages/h/media/plan.png');
  assert.deepEqual([...bytes], [1, 2, 3]);
});
