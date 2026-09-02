import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const contextSource = readFileSync(
  new URL('../office/PilotWorkspaceContext.tsx', import.meta.url),
  'utf8',
);

const appSource = readFileSync(
  new URL('../OfficeStudioApp.tsx', import.meta.url),
  'utf8',
);

test('Pilot Workspace invalidates case projection after Office Partner hydration', () => {
  assert.match(
    contextSource,
    /hydrateOfficePartnersFromServer/,
  );
  assert.match(
    contextSource,
    /setCaseRevision\(\(current\) => current \+ 1\)/,
  );
  assert.match(
    contextSource,
    /Office Partner authority could not be hydrated\./,
  );
});

test('Office parent does not rely on a disconnected partner revision rerender', () => {
  assert.doesNotMatch(
    appSource,
    /setOfficePartnerAuthorityRevision/,
  );
});
