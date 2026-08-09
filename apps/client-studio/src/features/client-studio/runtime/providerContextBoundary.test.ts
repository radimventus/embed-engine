import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  isRuntimeReadyForBinding,
  runtimeBindingKey,
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
    const source = readSource(
      'src/features/client-studio/ClientStudioPage.tsx',
    );

    assert.equal(source.includes('ExperienceBindingProvider'), false);
    assert.equal(source.includes('InterpretationProvider'), false);
    assert.equal(source.includes('DecisionStoryProvider'), false);
    assert.match(source, /DecisionSessionRuntimeProvider/);
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
