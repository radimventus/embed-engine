/**
 * PT-VR-07 — Workspace switcher role matrix.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  WORKSPACE_STUDIO_SWITCH_ORDER,
  workspaceStudiosForRoles,
} from './workspaceStudioNavigation';

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
