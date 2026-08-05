/**
 * CAP-OP-06 — Office ops Workflow Runtime tests (PT-VR-01 restored catalog).
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
    assert.equal(PILOT_WORKFLOW_STEP_DEFS.length, 7);
    assert.ok(
      PILOT_WORKFLOW_STEP_DEFS.every((step) => step.terminalView !== undefined),
    );
  });

  it('projects case status into done / active / waiting', () => {
    const waiting = buildWorkflowSteps(getPilotWorkspaceCase('villa-168'));
    assert.equal(activeWorkflowStepId(waiting), 'qr_payment');
    assert.equal(waiting.find((s) => s.id === 'offer')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'order')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'proforma')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'qr_payment')?.state, 'active');

    const checkout = buildWorkflowSteps(
      getPilotWorkspaceCase('harmony-124'),
    );
    assert.equal(activeWorkflowStepId(checkout), 'order');

    const offer = buildWorkflowSteps(
      getPilotWorkspaceCase('family-98'),
    );
    assert.equal(activeWorkflowStepId(offer), 'offer');
  });

  it('highlights navigated step and maps terminal views', () => {
    const activeCase = getPilotWorkspaceCase('villa-168');
    let state = createInitialWorkflowRuntimeState(activeCase);
    assert.equal(state.projectedActiveStepId, 'qr_payment');

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
      caseId: 'villa-168',
      terminalView: 'detail',
    });
    assert.equal(nav.type, 'workflow.step.navigated');
  });

  it('wires Workflow Runtime into navigator, terminal and provider', () => {
    const navigator = read(
      'features/pilot-workspace/PilotWorkflowNavigator.tsx',
    );
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    const context = read('office/PilotWorkspaceContext.tsx');

    assert.match(navigator, /data-workflow-catalog="defs"/);
    assert.match(navigator, /Workflow/);
    assert.match(terminal, /PilotTerminalWorkflow/);
    assert.doesNotMatch(terminal, /CommercialJourneyScreen/);
    assert.match(context, /navigateWorkflowStep/);
    assert.match(context, /navigateCommercialJourneyStep/);
  });
});
