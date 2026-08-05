/**
 * CAP-OP-01 / CAP-OP-02 / CAP-OP-10A / PT-VR-01 / PT-VR-01A — Working Terminal + global project nav.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  PILOT_CANVELO_STEPS,
  PILOT_INBOX_SECTIONS,
  PILOT_TERMINAL_DEFAULT_VIEW,
  PILOT_TERMINAL_VIEWS,
  PILOT_WORKSPACE_DEMO_CASES,
  buildCanveloIndicators,
  filterCasesByWorkflowPhase,
  getPilotWorkspaceCase,
  isPilotTerminalViewId,
  workflowPhaseForCaseStatus,
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
    assert.equal(PILOT_TERMINAL_DEFAULT_VIEW, 'inbox');
    assert.equal(isPilotTerminalViewId('inbox'), true);
    assert.equal(isPilotTerminalViewId('journey'), false);
  });

  it('exposes demo cases; recovery persists case id only', () => {
    assert.ok(PILOT_WORKSPACE_DEMO_CASES.length >= 1);
    assert.ok(getPilotWorkspaceCase(PILOT_WORKSPACE_DEMO_CASES[0]!.id));
    const model = read('office/pilotWorkspaceModel.ts');
    const recovery = read('office/officeWorkspaceRecovery.ts');
    assert.doesNotMatch(model, /localStorage/);
    assert.match(recovery, /workspaceRecovery/);
    assert.match(recovery, /resolveOfficeBootCaseId/);
  });
});

describe('CAP-OP-10A global project navigation wiring', () => {
  it('ships Select Project in left rail and Terminal|Workflow work surface', () => {
    const app = read('OfficeStudioApp.tsx');
    const sidebar = read('components/OfficeSidebar.tsx');
    const selector = read('features/pilot-workspace/PilotProjectSelector.tsx');
    const surface = read('features/pilot-workspace/OfficeWorkSurface.tsx');
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    const workflow = read('features/pilot-workspace/PilotWorkflowNavigator.tsx');
    const context = read('office/PilotWorkspaceContext.tsx');
    const css = read('index.css');
    const routes = read('office/officeRoutes.ts');

    assert.match(app, /PilotWorkspaceProvider/);
    assert.match(app, /OfficeWorkSurface/);
    assert.match(app, /CommercialJourneySurface/);
    assert.match(app, /DEFAULT_PILOT_MAILBOX_ID/);
    assert.doesNotMatch(app, /PilotCasesPanel/);
    assert.doesNotMatch(routes, /label: 'Pilot Workspace'/);
    assert.doesNotMatch(sidebar, /Pilot Workspace/);

    assert.match(sidebar, /PilotProjectSelector/);
    assert.match(sidebar, /onEnterWorkSurface/);
    assert.match(sidebar, /onNavigate\('work'\)/);
    assert.match(selector, /Projekty/);
    assert.match(selector, /office-sidebar__projects/);
    assert.match(selector, /Select Project/);
    assert.match(selector, /pilot-project-add/);
    assert.match(selector, /data-office-project-context="global"/);

    assert.match(surface, /PilotWorkingTerminal/);
    assert.match(surface, /PilotWorkflowNavigator/);
    assert.match(surface, /data-office-mode="work"/);
    assert.match(terminal, /PilotTerminalInbox/);
    assert.match(terminal, /PilotTerminalListing/);
    assert.match(workflow, /navigateWorkflowStep/);
    assert.match(context, /selectCase/);
    assert.match(context, /writeStoredActiveCaseId/);
    assert.match(css, /office-sidebar__projects/);
    assert.match(routes, /commercial-journey/);
  });

  it('wires Business Automation through host bridge not Working Terminal UI', () => {
    const host = read('office/officeAutomationHost.ts');
    assert.match(host, /createOfficeHostWorkflowAutomation/);
  });
});

describe('CAP-OP-02 working terminal', () => {
  it('builds Canvelo indicators without progress-bar semantics', () => {
    const ready = buildCanveloIndicators('pilot_ready');
    assert.equal(ready.length, PILOT_CANVELO_STEPS.length);
    assert.ok(
      ready.every((step, index) =>
        index < 4 ? step.state === 'done' : step.state === 'current',
      ),
    );
  });

  it('filters working map by Workflow phase', () => {
    const atProforma = filterCasesByWorkflowPhase(
      PILOT_WORKSPACE_DEMO_CASES,
      'proforma',
    );
    assert.equal(atProforma.length, 1);
    assert.equal(atProforma[0]?.id, 'case-dse-starter');
    assert.equal(workflowPhaseForCaseStatus('checkout'), 'order');
    assert.deepEqual(
      filterCasesByWorkflowPhase(PILOT_WORKSPACE_DEMO_CASES, null).map(
        (item) => item.id,
      ),
      PILOT_WORKSPACE_DEMO_CASES.map((item) => item.id),
    );
  });

  it('exposes Inbox sections Nové / Čeká na odpověď / Nepřiřazené / Archiv', () => {
    assert.deepEqual(
      PILOT_INBOX_SECTIONS.map((section) => section.label),
      ['Nové', 'Čeká na odpověď', 'Nepřiřazené', 'Archiv'],
    );
  });

  it('wires Working Terminal tabs for Office operator work', () => {
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    assert.match(terminal, /PilotTerminalListing/);
    assert.match(terminal, /PilotTerminalDetail/);
    assert.match(terminal, /PilotTerminalInbox/);
    assert.match(terminal, /PilotTerminalTimeline/);
    assert.match(terminal, /PilotTerminalWorkflow/);
    assert.doesNotMatch(terminal, /CommercialJourneyScreen/);
    assert.doesNotMatch(terminal, /data-office-mode="commercial-journey"/);
  });

  it('PT-VR-01A restores PlatformShell header and never-empty Select Project', () => {
    const app = read('OfficeStudioApp.tsx');
    const recovery = read('office/officeWorkspaceRecovery.ts');
    const selector = read('features/pilot-workspace/PilotProjectSelector.tsx');
    assert.match(app, /PlatformShell/);
    assert.doesNotMatch(
      app,
      /if \(isOperatorWorkspaceMode\(\)\) \{\s*return workspaceBody;/,
    );
    assert.match(recovery, /resolveOfficeBootCaseId/);
    assert.match(selector, /Select Project/);
  });
});

describe('PT-VR-01 Partner Commercial Journey isolation', () => {
  it('exposes Partner Commercial Journey as last left-nav item', () => {
    const routes = read('office/officeRoutes.ts');
    const surface = read(
      'features/pilot-workspace/CommercialJourneySurface.tsx',
    );
    const nav = read('features/pilot-workspace/CommercialJourneyNavigator.tsx');
    assert.match(routes, /commercial-journey/);
    assert.match(routes, /Partner Commercial Journey/);
    assert.match(surface, /data-office-mode="commercial-journey"/);
    assert.match(nav, /navigateCommercialJourneyStep/);
  });
});
