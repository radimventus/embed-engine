/**
 * CAP-OP-06 / PT-CJ-OS-01 — Commercial Journey Workflow Runtime tests.
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

describe('PT-CJ-OS-01 commercial journey workflow runtime', () => {
  it('exposes Commercial Journey steps without progress bars', () => {
    assert.deepEqual(
      PILOT_WORKFLOW_STEP_DEFS.map((step) => step.label),
      [
        'Welcome',
        'Pilot Program',
        'Order Confirmation',
        'Payment',
        'Pilot Confirmed',
        'Office Handoff',
      ],
    );
    assert.ok(
      PILOT_WORKFLOW_STEP_DEFS.every((step) => step.terminalView === 'journey'),
    );
  });

  it('projects case status into done / active / waiting on Commercial Journey', () => {
    const waiting = buildWorkflowSteps(getPilotWorkspaceCase('case-dse-starter'));
    assert.equal(activeWorkflowStepId(waiting), 'payment');
    assert.equal(waiting.find((s) => s.id === 'welcome')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'pilot_program')?.state, 'done');
    assert.equal(
      waiting.find((s) => s.id === 'order_confirmation')?.state,
      'done',
    );
    assert.equal(waiting.find((s) => s.id === 'payment')?.state, 'active');
    assert.equal(
      waiting.find((s) => s.id === 'pilot_confirmed')?.state,
      'waiting',
    );

    const checkout = buildWorkflowSteps(
      getPilotWorkspaceCase('case-nord-pilot'),
    );
    assert.equal(activeWorkflowStepId(checkout), 'order_confirmation');

    const offer = buildWorkflowSteps(
      getPilotWorkspaceCase('case-atelier-studio'),
    );
    assert.equal(activeWorkflowStepId(offer), 'pilot_program');
  });

  it('highlights navigated step and keeps journey terminal view', () => {
    const activeCase = getPilotWorkspaceCase('case-dse-starter');
    let state = createInitialWorkflowRuntimeState(activeCase);
    assert.equal(state.projectedActiveStepId, 'payment');

    const welcome = state.steps.find((step) => step.id === 'welcome');
    assert.equal(welcome?.terminalView, 'journey');

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

  it('wires Commercial Journey into navigator, terminal and provider', () => {
    const navigator = read(
      'features/pilot-workspace/PilotWorkflowNavigator.tsx',
    );
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    const screen = read(
      'features/pilot-workspace/terminal/CommercialJourneyScreen.tsx',
    );
    const context = read('office/PilotWorkspaceContext.tsx');
    const catalog = read('office/pilotWorkflowCatalog.ts');
    const css = read('index.css');

    assert.match(navigator, /data-workflow-runtime/);
    assert.match(navigator, /data-workflow-catalog="commercial-journey"/);
    assert.match(navigator, /Commercial Journey/);
    assert.match(navigator, /navigateWorkflowStep/);
    assert.match(navigator, /pilot-workflow-nav-/);
    assert.match(navigator, /title=\{step\.label\}/);
    assert.doesNotMatch(navigator, /contextHint/);
    assert.doesNotMatch(navigator, /PlatformCard/);
    assert.doesNotMatch(navigator, /shell-note/);
    assert.match(terminal, /CommercialJourneyScreen/);
    assert.match(terminal, /data-terminal-view="journey"/);
    assert.match(terminal, /data-office-mode="commercial-journey"/);
    assert.match(screen, /Vítejte ve svém CONIS Studio/);
    assert.match(screen, /Vybrat pilotní program/);
    assert.doesNotMatch(terminal, /PilotTerminalListing/);
    assert.doesNotMatch(terminal, /PilotTerminalDetail/);
    assert.match(context, /navigateWorkflowStep/);
    assert.match(context, /workflow/);
    assert.match(catalog, /PilotWorkflowCatalogProjector/);
    assert.match(catalog, /workflow.step.navigated/);
    assert.match(css, /office-pilot-workflow-nav/);
    assert.match(css, /office-cj-screen/);
    assert.doesNotMatch(navigator, /progress-bar/);
    assert.doesNotMatch(css, /progress-bar/);

    const model = read('office/pilotWorkflowModel.ts');
    assert.match(model, /Commercial Journey/);
    assert.match(model, /PILOT_WORKFLOW_STEP_DEFS/);
    assert.doesNotMatch(model, /contextHint/);
  });
});
