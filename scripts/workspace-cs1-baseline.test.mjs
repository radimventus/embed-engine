import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = join(root, 'docs/workspace-cs1');
const read = (path) => readFileSync(join(baseline, path), 'utf8');

test('CS1 is a direct-loadable immutable snapshot of the approved source', () => {
  const metadata = JSON.parse(read('baseline.json'));
  const index = read('index.html');
  assert.equal(metadata.BASELINE_SOURCE_SHA, '5d05797e889ba71dc1f18ba0b61d1696db180c32');
  assert.equal(metadata.BASELINE_GENERATION, 'CS1');
  assert.equal(metadata.PURPOSE, 'PRE_TASK_120_PRIORITY_BASELINE');
  assert.equal(read('404.html'), index);
  assert.match(index, /\/workspace-cs1\/assets\/index-[^"']+\.js/);
});

test('CS1 carries its reference House data and client media', () => {
  const manifest = read('house-packages/bungalov-4kk/manifest.json');
  assert.match(manifest, /"basePath": "\/workspace-cs1\/house-packages\/bungalov-4kk"/);
  for (const path of [
    'house-packages/bungalov-4kk/media/hero/hero.png',
    'house-packages/bungalov-4kk/media/gallery/01.webp',
    'house-packages/bungalov-4kk/floor-plan/ground-floor.png',
    'reference-house/house.json',
  ]) assert.equal(existsSync(join(baseline, path)), true, path);
});

test('CS1 retains the original Priority journey and Decision Topic chat handoff', () => {
  const index = read('index.html');
  const scriptPath = /src="\/workspace-cs1\/(assets\/index-[^"]+\.js)"/.exec(index)?.[1];
  assert.ok(scriptPath);
  const bundle = read(scriptPath);
  for (const contract of [
    'priority-conversation-question-intent',
    'priority-relationships',
    'priority-relationship-dialog',
    'priority-relationship-ask-conis',
    'Zeptat se CONIS',
  ]) assert.match(bundle, new RegExp(contract));
  assert.match(bundle, /\/workspace-cs1\/house-packages\/bungalov-4kk/);
});

test('normal Studio release neither builds nor replaces CS1', () => {
  const publish = readFileSync(join(root, 'scripts/publish-studio-platform.mjs'), 'utf8');
  assert.doesNotMatch(publish, /workspace-cs1/);
  assert.match(publish, /path\.join\(docsRoot, "studio", id\)/);
});
