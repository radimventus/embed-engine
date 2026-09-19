import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function readFeatureSource(fileName: string): string {
  return readFileSync(join(here, '..', fileName), 'utf8');
}

describe('Workspace scroll render isolation', () => {
  for (const fileName of [
    'ClientStudioSidebar.tsx',
    'ClientStudioMobileNav.tsx',
  ]) {
    it(`${fileName} keeps canonical registry reads outside scroll-only renders`, () => {
      const source = readFeatureSource(fileName);
      const bindingMemo = source.match(
        /const binding = useMemo\(\s*\(\) => resolveClientRuntimeBinding\(\),\s*\[([\s\S]*?)\],\s*\);/,
      );

      assert.ok(bindingMemo, 'runtime binding must be memoized');
      assert.match(bindingMemo[1] ?? '', /session\?\.projectId/);
      assert.match(bindingMemo[1] ?? '', /session\?\.activeHouseId/);
      assert.match(
        bindingMemo[1] ?? '',
        /session\?\.workspaceContext\?\.projectId/,
      );
      assert.match(
        bindingMemo[1] ?? '',
        /session\?\.workspaceContext\?\.activeHouseId/,
      );
    });
  }
});
