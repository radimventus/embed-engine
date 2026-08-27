import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const breadcrumb = readFileSync(
  new URL('./PlatformBreadcrumb.tsx', import.meta.url),
  'utf8',
);

const css = readFileSync(
  new URL('./platform-shell.css', import.meta.url),
  'utf8',
);

test('mobile Client Studio can suppress Company breadcrumb presentation', () => {
  assert.match(
    breadcrumb,
    /data-platform-breadcrumb-id=\{item\.id\}/,
  );

  assert.match(
    css,
    /\[data-studio='client'\]/,
  );

  assert.match(
    css,
    /\[data-platform-breadcrumb-id='company'\]/,
  );

  assert.match(
    css,
    /display:\s*none/,
  );
});

test('Company breadcrumb suppression is scoped to mobile responsive CSS', () => {
  const media = css.indexOf('@media (max-width: 720px)');
  const rule = css.indexOf(
    "[data-platform-breadcrumb-id='company']",
  );

  assert.ok(media >= 0);
  assert.ok(rule > media);
});
