import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, '../../../..');

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Application Foundation (CSCB-01 / SR-001)', () => {
  it('mounts through a single main entry and AppShell', () => {
    const main = readSource('src/main.tsx');
    const app = readSource(
      'src/features/client-studio/ClientStudioApp.tsx',
    );

    assert.match(main, /ErrorBoundary/);
    assert.match(main, /ClientStudioApp/);
    assert.equal(main.includes('createRoot'), true);
    assert.match(app, /AppShell/);
    assert.match(app, /ClientStudioHeader/);
    assert.match(app, /ClientStudioSidebar/);
    assert.match(app, /ClientStudioPage/);
  });

  it('bootstraps Decision Session Runtime only via the Provider', () => {
    const provider = readSource(
      'src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );
    const page = readSource(
      'src/features/client-studio/ClientStudioPage.tsx',
    );
    const app = stripComments(
      readSource('src/features/client-studio/ClientStudioApp.tsx'),
    );

    assert.match(provider, /createDecisionSessionRuntime/);
    assert.match(page, /DecisionSessionRuntimeProvider/);
    assert.match(page, /RuntimeBootstrapGate/);
    assert.equal(app.includes('createDecisionSessionRuntime'), false);
  });

  it('keeps shell navigation wired to journey section ids', () => {
    const vocabulary = readSource(
      'src/features/client-studio/pilot/pilotVocabulary.ts',
    );
    const sidebar = readSource(
      'src/features/client-studio/ClientStudioSidebar.tsx',
    );
    const header = readSource(
      'src/features/client-studio/ClientStudioHeader.tsx',
    );
    const contactMenu = readSource(
      'src/features/client-studio/header/HeaderContactMenu.tsx',
    );
    const saveMenu = readSource(
      'src/features/client-studio/header/HeaderSaveMenu.tsx',
    );
    const contact = readSource(
      'src/features/client-studio/header/experienceContact.ts',
    );

    assert.match(vocabulary, /PILOT_SECTION_NAV/);
    assert.match(vocabulary, /hero:/);
    assert.match(vocabulary, /aiAdvisor:/);
    assert.match(sidebar, /PILOT_SECTION_NAV/);
    assert.match(sidebar, /useActiveSection/);
    assert.match(sidebar, /scrollToSection/);
    assert.match(header, /HeaderContactMenu/);
    assert.match(header, /HeaderSaveMenu/);
    assert.match(header, /formatExperienceHeaderTitle/);
    assert.match(header, /w-canvas/);
    assert.match(contactMenu, /mailto:/);
    assert.match(contactMenu, /tel:/);
    assert.match(saveMenu, /Uložit tuto stránku jako PDF/);
    assert.match(saveMenu, /window\.print/);
    assert.match(contact, /kontakt@astav\.cz/);
    assert.match(contact, /\+420 987 654 321/);
  });

  it('does not change Runtime package APIs from the app shell', () => {
    const provider = stripComments(
      readSource(
        'src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx',
      ),
    );

    assert.match(provider, /createSystemClock/);
    assert.match(provider, /createDecisionSessionRuntime/);
    assert.equal(provider.includes('composeDecision'), false);
    assert.equal(provider.includes('interpretDecisionSession'), false);
  });
});
