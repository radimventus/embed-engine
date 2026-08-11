/**
 * PT-VR-07 — Workspace switcher role matrix.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  WORKSPACE_STUDIO_SWITCH_ORDER,
  workspaceStudiosForRoles,
} from './workspaceStudioNavigation';
import { canAccessStudio } from './roles';

describe('PT-VR-07 workspaceStudiosForRoles', () => {
  it('keeps canonical five-studio order', () => {
    assert.deepEqual([...WORKSPACE_STUDIO_SWITCH_ORDER], [
      'client',
      'manager',
      'sales',
      'builder',
      'office',
    ]);
  });

  it('conis-admin sees all five studios', () => {
    assert.deepEqual(
      [...workspaceStudiosForRoles(['conis-admin'])],
      [...WORKSPACE_STUDIO_SWITCH_ORDER],
    );
  });

  it('project manager sees Client · Manager · Sales only', () => {
    assert.deepEqual([...workspaceStudiosForRoles(['manager'])], [
      'client',
      'manager',
      'sales',
    ]);
    assert.deepEqual([...workspaceStudiosForRoles(['project-admin'])], [
      'client',
      'manager',
      'sales',
      'builder',
      'office',
    ]);
    assert.equal(canAccessStudio(['manager'], 'client'), true);
    assert.equal(canAccessStudio(['manager'], 'manager'), true);
    assert.equal(canAccessStudio(['manager'], 'sales'), true);
    assert.equal(canAccessStudio(['manager'], 'office'), false);
    assert.equal(canAccessStudio(['manager'], 'builder'), false);
  });

  it('salesman sees Client · Sales only', () => {
    assert.deepEqual([...workspaceStudiosForRoles(['salesman'])], [
      'client',
      'sales',
    ]);
  });

  it('builder sees Client · Builder only', () => {
    assert.deepEqual([...workspaceStudiosForRoles(['builder'])], [
      'client',
      'builder',
    ]);
  });
});
