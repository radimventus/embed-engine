import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  decisionSessionPointerKey,
  readDecisionSessionPointer,
  writeDecisionSessionPointer,
} from './decisionSessionPointer';
import { isDurableDecisionCommand } from './durableDecisionSessionClient';

const here = dirname(fileURLToPath(import.meta.url));

describe('Durable Decision Session client pointer', () => {
  it('stores identity per Company / Project / House and does not leak', () => {
    const store = new Map<string, string>();
    const adapter = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    const bungalov = {
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-bungalov',
    };
    const vpd = {
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-vpd',
    };
    const otherProject = {
      companyId: 'company-a',
      projectId: 'project-b',
      houseId: 'house-bungalov',
    };

    writeDecisionSessionPointer(
      bungalov,
      '11111111-1111-4111-8111-111111111111',
      adapter,
    );

    assert.equal(
      readDecisionSessionPointer(bungalov, adapter),
      '11111111-1111-4111-8111-111111111111',
    );
    assert.equal(readDecisionSessionPointer(vpd, adapter), null);
    assert.equal(readDecisionSessionPointer(otherProject, adapter), null);
    assert.notEqual(
      decisionSessionPointerKey(bungalov),
      decisionSessionPointerKey(vpd),
    );
  });

  it('persists semantic Room, Priority, Answer, and OpenQuestion commands', () => {
    assert.equal(isDurableDecisionCommand('SelectRoom'), true);
    assert.equal(isDurableDecisionCommand('ChangePriority'), true);
    assert.equal(isDurableDecisionCommand('AnswerQuestion'), true);
    assert.equal(isDurableDecisionCommand('OpenQuestion'), true);
    assert.equal(isDurableDecisionCommand('SelectVariant'), false);
  });

  it('keeps Embed / Workspace on the same Client persist and restore path', () => {
    const provider = readFileSync(
      join(here, 'DecisionSessionRuntimeProvider.tsx'),
      'utf8',
    );
    const mount = readFileSync(
      join(here, '../../../embed/mountClientStudio.tsx'),
      'utf8',
    );
    assert.match(provider, /persistPublicDecisionSession/);
    assert.match(provider, /restorePublicDecisionSession/);
    assert.match(provider, /serializeDecisionSession/);
    assert.match(mount, /DecisionSessionRuntimeProvider/);
    assert.match(
      mount,
      /identical to standalone Client Studio/,
    );
  });
});
