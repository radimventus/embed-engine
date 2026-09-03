import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path: string) =>
  readFile(new URL(`../../../../${path}`, import.meta.url), 'utf8');

test('TASK 86 — Office selector is Project-only and has no legacy create action', async () => {
  const source = await read(
    'apps/office-studio/src/features/pilot-workspace/PilotProjectSelector.tsx',
  );
  assert.match(source, /label:\s*item\.projectTitle/);
  assert.doesNotMatch(source, /pilot-project-add/);
  assert.doesNotMatch(source, /createCasePlaceholder/);
});

test('TASK 86 — Office Project Detail owns Project-scoped logo editing', async () => {
  const source = await read(
    'apps/office-studio/src/features/pilot-workspace/terminal/PilotTerminalDetail.tsx',
  );
  assert.match(source, /project-logo-upload/);
  assert.match(source, /project-logo-remove/);
  assert.match(source, /\/public\/projects\/.*\/logo/);
  assert.doesNotMatch(source, /partnerBrandingStore/);
});

test('TASK 86 — Client Experience renders real Project logo without pseudo SVG', async () => {
  const mark = await read(
    'apps/client-studio/src/features/client-studio/PartnerBrandMark.tsx',
  );
  const header = await read(
    'apps/client-studio/src/features/client-studio/ClientStudioHeader.tsx',
  );

  assert.match(mark, /<img/);
  assert.doesNotMatch(mark, /<svg/);
  assert.doesNotMatch(mark, /colors\.brand/);
  assert.match(header, /projection\.branding\.logoUrl/);
});
