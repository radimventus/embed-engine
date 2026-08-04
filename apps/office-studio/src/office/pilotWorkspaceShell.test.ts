/**
 * CAP-OP-01 / PT-04 — Pilot Workspace shell tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  PILOT_TERMINAL_DEFAULT_VIEW,
  PILOT_TERMINAL_VIEWS,
  PILOT_WORKSPACE_DEMO_CASES,
  getPilotWorkspaceCase,
  isPilotTerminalViewId,
} from './pilotWorkspaceModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('CAP-OP-01 pilot workspace model', () => {
  it('keeps canonical terminal order with Inbox as default', () => {
    assert.deepEqual(
      PILOT_TERMINAL_VIEWS.map((view) => view.id),
      ['listing', 'detail', 'inbox', 'timeline', 'workflow'],
    );
    assert.deepEqual(
      PILOT_TERMINAL_VIEWS.map((view) => view.label),
      ['Výpis', 'Detail', 'Inbox', 'Timeline', 'Workflow'],
    );
    assert.equal(PILOT_TERMINAL_DEFAULT_VIEW, 'inbox');
    assert.equal(isPilotTerminalViewId('inbox'), true);
    assert.equal(isPilotTerminalViewId('canvelo'), false);
  });

  it('exposes in-memory demo commercial cases without persistence APIs', () => {
    assert.ok(PILOT_WORKSPACE_DEMO_CASES.length >= 1);
    assert.ok(getPilotWorkspaceCase(PILOT_WORKSPACE_DEMO_CASES[0]!.id));
    const model = read('office/pilotWorkspaceModel.ts');
    const context = read('office/PilotWorkspaceContext.tsx');
    assert.doesNotMatch(model, /localStorage/);
    assert.doesNotMatch(context, /localStorage/);
    assert.doesNotMatch(context, /officeLocalStore/);
  });
});

describe('CAP-OP-01 pilot workspace shell wiring', () => {
  it('ships project selector, 3-column shell and shared context', () => {
    const page = read('features/pilot-workspace/PilotWorkspacePage.tsx');
    const selector = read('features/pilot-workspace/PilotProjectSelector.tsx');
    const cases = read('features/pilot-workspace/PilotCasesPanel.tsx');
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    const workflow = read('features/pilot-workspace/PilotWorkflowNavigator.tsx');
    const context = read('office/PilotWorkspaceContext.tsx');
    const css = read('index.css');
    const app = read('OfficeStudioApp.tsx');

    assert.match(page, /PilotWorkspaceProvider/);
    assert.match(page, /PilotProjectSelector/);
    assert.match(page, /PilotCasesPanel/);
    assert.match(page, /PilotWorkingTerminal/);
    assert.match(page, /PilotWorkflowNavigator/);
    assert.match(page, /pilot-workspace-grid/);

    assert.match(selector, /Obchodní případ/);
    assert.match(selector, /Select Project/);
    assert.match(selector, /pilot-project-add/);
    assert.match(cases, /pilot-cases-list/);
    assert.match(terminal, /pilot-working-terminal/);
    assert.match(terminal, /pilot-terminal-tab-\$\{view\.id\}/);
    assert.match(terminal, /PILOT_TERMINAL_VIEWS/);
    assert.match(terminal, /pilot-inbox-default/);
    assert.match(workflow, /pilot-workflow-navigator/);
    assert.match(context, /PilotWorkspaceProvider/);
    assert.match(context, /usePilotWorkspaceContext/);

    assert.match(css, /office-pilot-ws__grid/);
    assert.match(css, /minmax\(0, 25%\) minmax\(0, 50%\) minmax\(0, 25%\)/);
    assert.match(app, /PilotWorkspacePage/);
    assert.match(app, /pilot-workspace/);
  });
});
