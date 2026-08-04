/**
 * CAP-OP-06 / PT-09 — Workflow Runtime tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { getPilotWorkspaceCase } from './pilotWorkspaceModel';
import {
  activeWorkflowStepId,
  buildWorkflowSteps,
  PILOT_WORKFLOW_STEP_DEFS,
} from './pilotWorkflowModel';
import {
  createInitialWorkflowRuntimeState,
  reducePilotWorkflow,
} from './pilotWorkflowRuntime';
import { buildWorkflowNavigationEvent } from './pilotWorkflowCatalog';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('CAP-OP-06 workflow runtime', () => {
  it('exposes Nabídka → Active Partner steps without progress bars', () => {
    assert.deepEqual(
      PILOT_WORKFLOW_STEP_DEFS.map((step) => step.label),
      [
        'Nabídka',
        'Objednávka',
        'Proforma',
        'QR Platba',
        'Pilot Ready',
        'Builder',
        'Active Partner',
      ],
    );
  });

  it('projects case status into done / active / waiting', () => {
    const waiting = buildWorkflowSteps(getPilotWorkspaceCase('case-dse-starter'));
    assert.equal(activeWorkflowStepId(waiting), 'qr_payment');
    assert.equal(waiting.find((s) => s.id === 'offer')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'order')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'proforma')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'qr_payment')?.state, 'active');
    assert.equal(waiting.find((s) => s.id === 'pilot_ready')?.state, 'waiting');

    const checkout = buildWorkflowSteps(getPilotWorkspaceCase('case-nord-pilot'));
    assert.equal(activeWorkflowStepId(checkout), 'order');

    const offer = buildWorkflowSteps(getPilotWorkspaceCase('case-atelier-studio'));
    assert.equal(activeWorkflowStepId(offer), 'offer');
  });

  it('highlights navigated step and maps terminal views', () => {
    const activeCase = getPilotWorkspaceCase('case-dse-starter');
    let state = createInitialWorkflowRuntimeState(activeCase);
    assert.equal(state.projectedActiveStepId, 'qr_payment');

    const proforma = state.steps.find((step) => step.id === 'proforma');
    assert.equal(proforma?.terminalView, 'timeline');

    state = reducePilotWorkflow(state, {
      type: 'highlight-step',
      stepId: 'offer',
    });
    assert.equal(state.highlightedStepId, 'offer');
    assert.equal(
      state.steps.find((step) => step.id === 'offer')?.terminalView,
      'detail',
    );

    const nav = buildWorkflowNavigationEvent({
      stepId: 'offer',
      caseId: 'case-dse-starter',
      terminalView: 'detail',
    });
    assert.equal(nav.type, 'workflow.step.navigated');
  });

  it('wires Workflow Runtime into navigator, terminal and provider', () => {
    const navigator = read(
      'features/pilot-workspace/PilotWorkflowNavigator.tsx',
    );
    const terminal = read(
      'features/pilot-workspace/terminal/PilotTerminalWorkflow.tsx',
    );
    const context = read('office/PilotWorkspaceContext.tsx');
    const catalog = read('office/pilotWorkflowCatalog.ts');
    const css = read('index.css');

    assert.match(navigator, /data-workflow-runtime/);
    assert.match(navigator, /navigateWorkflowStep/);
    assert.match(navigator, /pilot-workflow-nav-/);
    assert.match(terminal, /data-workflow-runtime/);
    assert.match(terminal, /pilot-workflow-board/);
    assert.match(context, /navigateWorkflowStep/);
    assert.match(context, /workflow/);
    assert.match(catalog, /PilotWorkflowCatalogProjector/);
    assert.match(catalog, /workflow.step.navigated/);
    assert.match(css, /office-pilot-workflow-nav/);
    assert.doesNotMatch(navigator, /progress-bar/);
    assert.doesNotMatch(css, /progress-bar/);
  });
});
