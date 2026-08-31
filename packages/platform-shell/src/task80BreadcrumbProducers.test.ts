import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const root = path.resolve(process.cwd(), '../..');

function read(relative: string): string {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

describe('TASK 80 breadcrumb producers', () => {
  const producers = [
    'apps/workspace-host/src/WorkspaceHostApp.tsx',
    'apps/sales-studio/src/SalesStudioApp.tsx',
    'apps/manager-studio/src/components/layout/AppShell.tsx',
    'apps/builder-studio/src/features/builder-studio/BuilderStudioApp.tsx',
    'apps/office-studio/src/OfficeStudioApp.tsx',
  ];

  it('never cosmetically derives Project identity from company-*', () => {
    for (const file of producers) {
      const source = read(file);
      assert.doesNotMatch(
        source,
        /replace\([^)]*company-/,
        `${file} must not strip company- to invent Project identity`,
      );
    }
  });

  it('keeps internal company ids out of literal breadcrumb labels', () => {
    for (const file of producers) {
      const source = read(file);
      const breadcrumbRegion =
        source.match(/const breadcrumb[\s\S]{0,1400}?\];/)?.[0] ?? '';

      assert.doesNotMatch(
        breadcrumbRegion,
        /label:\s*['"`]company-/,
        `${file} leaks internal company identity`,
      );
    }
  });
});
