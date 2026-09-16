import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { activatedWistiaUrl, DeferredWistia, WISTIA_POSTER } from './DeferredWistia';

const src = 'https://fast.wistia.net/embed/iframe/sxe3yw702e?playerColor=123456';
const render = (activated?: boolean, surface: 'main' | 'thumbnail' = 'main') =>
  renderToStaticMarkup(createElement(DeferredWistia, { src, title: 'Video', activated, surface }));

test('both dormant surfaces render the canonical poster without player/runtime', () => {
  for (const html of [render(), render(false, 'thumbnail')]) {
    assert.ok(html.includes(WISTIA_POSTER));
    assert.match(html, /data-wistia-state="dormant"/);
    assert.doesNotMatch(html, /<iframe|<script/);
  }
});
test('activation is per surface, not shared by media id', () => {
  assert.match(render(true, 'thumbnail'), /<iframe/);
  assert.doesNotMatch(render(), /<iframe/);
  assert.match(render(), /aria-label="Přehrát video"/);
  assert.doesNotMatch(render(false, 'thumbnail'), /<button/);
});
test('loading retains the poster above an absolute player until API ready', () => {
  const html = render(true);
  assert.match(html, /data-wistia-state="loading"/);
  assert.ok(html.indexOf('<iframe') < html.indexOf('<img'));
  assert.match(html, /absolute inset-0 h-full w-full/);
});
test('activation preserves existing embed options and requests audible autoplay', () => {
  const url = new URL(activatedWistiaUrl(src));
  assert.equal(url.searchParams.get('playerColor'), '123456');
  assert.equal(url.searchParams.get('autoPlay'), 'true');
  assert.equal(url.searchParams.get('muted'), 'false');
  assert.equal(url.searchParams.get('silentAutoPlay'), 'false');
  assert.equal(url.searchParams.has('doNotTrack'), false);
});
test('production media and rail render the deferred component', () => {
  for (const name of ['MainMedia.tsx', 'ThumbnailRail.tsx']) {
    const source = readFileSync(new URL(name, import.meta.url), 'utf8');
    assert.match(source, /<DeferredWistia/);
    assert.doesNotMatch(source, /<iframe/);
  }
  const source = readFileSync(new URL('DeferredWistia.tsx', import.meta.url), 'utf8');
  assert.match(source, /if \(!active\) return/);
  assert.match(source, /id, onReady/);
  assert.doesNotMatch(source, /setTimeout|scrollToSection/);
});
