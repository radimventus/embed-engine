/**
 * PT-VR-01A — Office workspace recovery (last case → Inbox).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearOfficeMemoryMirrorForTests,
  removeJson,
  saveJson,
} from './officeLocalStore';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys';
import {
  readStoredActiveCaseId,
  resolveOfficeBootCaseId,
  writeStoredActiveCaseId,
} from './officeWorkspaceRecovery';
import { PILOT_WORKSPACE_DEMO_CASES } from './pilotWorkspaceModel';

describe('PT-VR-01A office workspace recovery', () => {
  it('restores last case when still present, else first available', () => {
    clearOfficeMemoryMirrorForTests();
    removeJson(OFFICE_STORAGE_KEYS.workspaceRecovery);

    assert.equal(
      resolveOfficeBootCaseId(PILOT_WORKSPACE_DEMO_CASES, null),
      PILOT_WORKSPACE_DEMO_CASES[0]?.id,
    );

    const second = PILOT_WORKSPACE_DEMO_CASES[1]!.id;
    writeStoredActiveCaseId(second);
    assert.equal(readStoredActiveCaseId(), second);
    assert.equal(
      resolveOfficeBootCaseId(PILOT_WORKSPACE_DEMO_CASES),
      second,
    );

    writeStoredActiveCaseId('case-missing');
    assert.equal(
      resolveOfficeBootCaseId(PILOT_WORKSPACE_DEMO_CASES),
      PILOT_WORKSPACE_DEMO_CASES[0]?.id,
    );

    saveJson(OFFICE_STORAGE_KEYS.workspaceRecovery, { caseId: '' });
    assert.equal(readStoredActiveCaseId(), null);
  });
});
