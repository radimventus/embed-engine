/**
 * CAP-OP-06 / PT-CJ-02 — Lean Commercial Journey Workflow Runtime tests.
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

describe('PT-CJ-02 lean commercial journey workflow runtime', () => {
  it('exposes five partner-facing Commercial Journey steps', () => {
    assert.deepEqual(
      PILOT_WORKFLOW_STEP_DEFS.map((step) => step.label),
      [
        'Vítejte',
        'Pilotní program',
        'Dokončit objednávku',
        'Platba',
        'CONIS Studio',
      ],
    );
    assert.ok(
      PILOT_WORKFLOW_STEP_DEFS.every((step) => step.terminalView === 'journey'),
    );
    assert.equal(PILOT_WORKFLOW_STEP_DEFS.length, 5);
  });

  it('projects case status into lean journey steps', () => {
    const waiting = buildWorkflowSteps(getPilotWorkspaceCase('case-dse-starter'));
    assert.equal(activeWorkflowStepId(waiting), 'payment');
    assert.equal(waiting.find((s) => s.id === 'welcome')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'pilot_program')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'complete_order')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'payment')?.state, 'active');
    assert.equal(waiting.find((s) => s.id === 'conis_studio')?.state, 'waiting');

    const checkout = buildWorkflowSteps(
      getPilotWorkspaceCase('case-nord-pilot'),
    );
    assert.equal(activeWorkflowStepId(checkout), 'complete_order');

    const offer = buildWorkflowSteps(
      getPilotWorkspaceCase('case-atelier-studio'),
    );
    assert.equal(activeWorkflowStepId(offer), 'pilot_program');

    const ready = buildWorkflowSteps({
      ...getPilotWorkspaceCase('case-dse-starter')!,
      status: 'pilot_ready',
    });
    assert.equal(activeWorkflowStepId(ready), 'conis_studio');
  });

  it('highlights navigated step and keeps journey terminal view', () => {
    const activeCase = getPilotWorkspaceCase('case-dse-starter');
    let state = createInitialWorkflowRuntimeState(activeCase);
    assert.equal(state.projectedActiveStepId, 'payment');

    state = reducePilotWorkflow(state, {
      type: 'highlight-step',
      stepId: 'welcome',
    });
    assert.equal(state.highlightedStepId, 'welcome');
    assert.equal(
      state.steps.find((step) => step.id === 'welcome')?.terminalView,
      'journey',
    );

    const nav = buildWorkflowNavigationEvent({
      stepId: 'welcome',
      caseId: 'case-dse-starter',
      terminalView: 'journey',
    });
    assert.equal(nav.type, 'workflow.step.navigated');
  });

  it('wires lean journey screens without Office Handoff', () => {
    const navigator = read(
      'features/pilot-workspace/PilotWorkflowNavigator.tsx',
    );
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    const screen = read(
      'features/pilot-workspace/terminal/CommercialJourneyScreen.tsx',
    );
    const css = read('index.css');

    assert.match(navigator, /data-workflow-catalog="commercial-journey"/);
    assert.match(navigator, /Commercial Journey/);
    assert.match(terminal, /CommercialJourneyScreen/);
    assert.match(screen, /CompleteOrderScreen/);
    assert.match(screen, /PaymentScreen/);
    assert.match(screen, /ConisStudioScreen/);
    assert.doesNotMatch(screen, /OfficeHandoff|PilotConfirmed|office_handoff/);
    assert.doesNotMatch(navigator, /Office Handoff|Pilot Confirmed/);
    assert.match(css, /office-cj-screen/);
  });
});
