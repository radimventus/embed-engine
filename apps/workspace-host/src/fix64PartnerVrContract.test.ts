import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workspaceHost = fs.readFileSync(
  new URL('./WorkspaceHostApp.tsx', import.meta.url),
  'utf8',
);

const accessRoot = fs.readFileSync(
  new URL('../../../packages/platform-access/src/react/PlatformAccessRoot.tsx', import.meta.url),
  'utf8',
);

const landing = fs.readFileSync(
  new URL('../../../packages/platform-access/src/react/PlatformLanding.tsx', import.meta.url),
  'utf8',
);

const cjCss = fs.readFileSync(
  new URL('../../office-studio/src/index.css', import.meta.url),
  'utf8',
);

test('FIX64 CJ uses horizontal schema and scrollable viewport', () => {
  assert.match(cjCss, /FIX64-V2-BEGIN/);
  assert.match(cjCss, /flex-direction:\s*row\s*!important/);
  assert.match(cjCss, /office-pilot-ws__terminal-body--journey/);
  assert.match(cjCss, /background:\s*#ffffff\s*!important/);

  assert.match(
    workspaceHost,
    /height:\s*'calc\(100vh - 64px\)'/,
  );
});

test('FIX64 Manager handoff completes START before navigation', () => {
  const start = landing.indexOf('const openManagerStudio = async');
  assert.ok(start >= 0);

  const slice = landing.slice(start, start + 500);
  assert.match(slice, /finishWelcome\(\)/);
});

test('FIX64 does not reintroduce visual WorkspaceEntryFrame chrome', () => {
  if (!accessRoot.includes('function WorkspaceEntryFrame')) return;

  const start = accessRoot.indexOf('function WorkspaceEntryFrame');
  const slice = accessRoot.slice(start, start + 1300);

  assert.doesNotMatch(slice, /PlatformShell/);
  assert.doesNotMatch(slice, /CONIS\s*\/\s*Workspace/);
});
