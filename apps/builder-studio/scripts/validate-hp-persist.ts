import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { persistBuilderHousePackage } from '../../../packages/object-house/src/builder-package/persistBuilderHousePackage';

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
  const root = join(repoRoot, 'apps/client-studio/public/house-package');
  const roomsPath = join(root, 'rooms.csv');
  const original = readFileSync(roomsPath, 'utf8');

  const result = await persistBuilderHousePackage({
    packageRoot: root,
    files: { roomsCsv: original },
  });

  if (!result.ok) {
    console.error('FAIL', result);
    process.exit(1);
  }

  const after = readFileSync(roomsPath, 'utf8');
  if (after !== original) {
    console.error('FAIL content changed unexpectedly');
    process.exit(1);
  }

  console.log(
    JSON.stringify({ ok: true, written: result.written, unchanged: true }, null, 2),
  );
}

void main();
