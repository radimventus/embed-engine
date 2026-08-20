import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  isClientContentUnavailable,
  isRuntimeReadyForBinding,
  runtimeBindingKey,
  isWorkspaceDraftContentUnavailable,
} from './DecisionSessionRuntimeProvider';

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

describe('Context-only Provider boundary (ED-DA-04)', () => {
  it('does not expose a previous House runtime during a new package bootstrap', () => {
    const previous = runtimeBindingKey(
      'bungalov-4kk',
      '/house-packages/bungalov-4kk',
    );
    const requested = runtimeBindingKey(
      'draft-house',
      '/house-packages/draft-house',
    );

    assert.equal(isRuntimeReadyForBinding(previous, requested), false);
    assert.equal(isRuntimeReadyForBinding(requested, requested), true);
  });

  it('keeps a canonical LIVE_EMPTY House available when it owns a package', () => {
    assert.equal(
      isClientContentUnavailable({
        injectedRuntime: false,
        hasAuthoringDraftPackage: false,
        dataMode: 'LIVE_EMPTY',
        runtimeHouseId:
          'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk',
        packagePublicRoot: '/house-packages/patrovy-5kk',
      }),
      false,
    );
  });

  it('does not render the workspace-draft empty state for VPD authoring content', () => {
    assert.equal(
      isWorkspaceDraftContentUnavailable({
        runtimeContentAvailable: false,
        authoringDraftPackage: {
          packageRoot:
            'apps/client-studio/public/house-packages/patrovy-5kk',
          packagePublicRoot: '/house-packages/patrovy-5kk',
          name: 'VÁŠ PRVNÍ DŮM',
        },
      }),
      false,
    );
  });

  it('bootstraps a LIVE_EMPTY canonical House through its durable overlay', () => {
    const source = stripComments(
      readSource(
        'src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx',
      ),
    );

    assert.match(source, /loadDurableHousePackageOverlay\(/);
    assert.doesNotMatch(
      source,
      /\}\)\s*\|\|\s*clientContentUnavailable\s*\)\s*\{/,
    );
  });

  it('keeps runtimeEvidence outside the Client binding and readiness path', () => {
    const provider = stripComments(
      readSource(
        'src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx',
      ),
    );
    const bootstrap = stripComments(
      readSource(
        'src/features/client-studio/runtime/builderPackageBootstrap.ts',
      ),
    );

    assert.doesNotMatch(provider, /isRuntimeEvidenceEnabled/);
    assert.match(bootstrap, /window\.setTimeout\(\(\) => \{/);
    assert.match(bootstrap, /Evidence must not delay the bootstrap promise/);
  });

  it('DecisionSessionRuntimeProvider does not expose runtime or interpretation', () => {
    const source = stripComments(
      readSource(
        'src/features/client-studio/runtime/DecisionSessionRuntimeProvider.tsx',
      ),
    );

    // Injection prop may exist for Embed Delivery; Context value must stay experience/ready/dispatch.
    assert.equal(source.includes('interpretation:'), false);
    assert.equal(source.includes('getInterpretation'), false);
    assert.equal(source.includes('runtime: runtime'), false);
    assert.equal(source.includes('runtime:runtime'), false);
    assert.match(source, /experience:/);
    assert.match(source, /dispatch:/);
    assert.match(source, /ready:/);
    assert.match(source, /clientContentUnavailable/);
    assert.match(source, /client-runtime-unavailable/);
    assert.doesNotMatch(
      source,
      /Builder House Package bootstrap failed: \{bootstrapError\}/,
    );
  });

  it('ClientStudioPage does not mount cognitive Providers', () => {
    const page = readSource(
      'src/features/client-studio/ClientStudioPage.tsx',
    );
    const app = readSource(
      'src/features/client-studio/ClientStudioApp.tsx',
    );

    assert.equal(page.includes('ExperienceBindingProvider'), false);
    assert.equal(page.includes('InterpretationProvider'), false);
    assert.equal(page.includes('DecisionStoryProvider'), false);
    assert.match(app, /DecisionSessionRuntimeProvider/);
  });

  it('WalkthroughProvider does not emit cognitive signals', () => {
    const source = readSource(
      'src/features/walkthrough/WalkthroughProvider.tsx',
    );

    assert.equal(source.includes('applyRoomViewed'), false);
    assert.equal(source.includes('applyFloorChanged'), false);
    assert.equal(source.includes('applyMediaOpened'), false);
    assert.equal(source.includes('useApplyCognitiveSignal'), false);
  });
});
