import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

test(
  'Magic Link reissue allocates billing before invite reissue',
  async () => {
    const source = await readFile(
      path.join(process.cwd(), 'src/index.ts'),
      'utf8',
    );

    const start = source.indexOf(
      'const reissueMatch = path.match(',
    );

    assert.notEqual(start, -1);

    const end = source.indexOf(
      'path.startsWith("/public/auth/activate/")',
      start,
    );

    assert.notEqual(end, -1);

    const route = source.slice(start, end);

    assert.ok(
      route.includes(
        'const current = await repository.findById(inviteId)',
      ),
    );

    assert.ok(
      route.includes('current.projectId'),
    );

    const billing = route.indexOf(
      'projectConfigs.ensureBillingNumber',
    );

    const reissue = route.indexOf(
      'repository.reissue(inviteId)',
    );

    assert.notEqual(billing, -1);
    assert.notEqual(reissue, -1);
    assert.ok(billing < reissue);

    assert.equal(
      route.match(
        /projectConfigs\.ensureBillingNumber/g,
      )?.length,
      1,
    );
  },
);
