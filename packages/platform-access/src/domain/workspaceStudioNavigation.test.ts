/**
 * PT-VR-07 — Workspace switcher role matrix.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  WORKSPACE_STUDIO_SWITCH_ORDER,
  workspaceStudiosForRoles,
} from './workspaceStudioNavigation';
import { authorizedStudioForRoles, canAccessStudio } from './roles';

describe('PT-VR-07 workspaceStudiosForRoles', () => {
  it('keeps canonical five-studio order', () => {
    assert.deepEqual([...WORKSPACE_STUDIO_SWITCH_ORDER], [
      'client',
      'sales',
      'manager',
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
      'sales',
      'manager',
    ]);
    assert.deepEqual([...workspaceStudiosForRoles(['project-admin'])], [
      'client',
      'sales',
      'manager',
      'builder',
      'office',
    ]);
    assert.equal(canAccessStudio(['manager'], 'client'), true);
    assert.equal(canAccessStudio(['manager'], 'manager'), true);
    assert.equal(canAccessStudio(['manager'], 'sales'), true);
    assert.equal(canAccessStudio(['manager'], 'office'), false);
    assert.equal(canAccessStudio(['manager'], 'builder'), false);
  });

  it('sanitizes URL, persisted and host selections to the role default', () => {
    assert.equal(authorizedStudioForRoles(['manager'], 'office'), 'manager');
    assert.equal(authorizedStudioForRoles(['manager'], 'builder'), 'manager');
    assert.equal(authorizedStudioForRoles(['salesman'], 'manager'), 'sales');
    assert.equal(authorizedStudioForRoles(['salesman'], 'office'), 'sales');
    assert.equal(authorizedStudioForRoles(['builder'], 'sales'), 'builder');
    assert.equal(authorizedStudioForRoles(['builder'], 'manager'), 'builder');
    assert.equal(authorizedStudioForRoles(['builder'], 'builder'), 'builder');
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
