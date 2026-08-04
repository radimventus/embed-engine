/**
 * CAP-OP-01 / CAP-OP-02 / CAP-OP-10A — Working Terminal + global project nav tests.
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
    assert.match(app, /DEFAULT_PILOT_MAILBOX_ID/);
    assert.doesNotMatch(app, /PilotCasesPanel/);
    assert.doesNotMatch(routes, /label: 'Pilot Workspace'/);
    assert.doesNotMatch(sidebar, /Pilot Workspace/);

    assert.match(sidebar, /PilotProjectSelector/);
    assert.match(selector, /Projekty/);
    assert.match(selector, /office-sidebar__projects/);
    assert.match(selector, /Select Project/);
    assert.match(selector, /pilot-project-add/);
    assert.match(selector, /data-office-project-context="global"/);
    assert.doesNotMatch(selector, /Obchodní případ/);

    assert.match(surface, /PilotWorkingTerminal/);
    assert.match(surface, /PilotWorkflowNavigator/);
    assert.doesNotMatch(surface, /PilotCasesPanel/);
    assert.doesNotMatch(surface, /PilotProjectSelector/);

    assert.match(terminal, /pilot-working-terminal/);
    assert.match(workflow, /pilot-workflow-navigator/);
    assert.match(context, /PilotWorkspaceProvider/);
    assert.match(context, /usePilotWorkspaceContext/);

    assert.match(css, /office-work-surface/);
    assert.match(css, /minmax\(0, 1fr\) minmax\(240px, 28%\)/);
  });
});

describe('CAP-OP-02 working terminal', () => {
  it('builds Canvelo indicators without progress-bar semantics', () => {
    assert.deepEqual(
      PILOT_CANVELO_STEPS.map((step) => step.id),
      ['offer', 'order', 'proforma', 'payment', 'pilot_ready'],
    );
    const waiting = buildCanveloIndicators('waiting_payment');
    assert.equal(waiting[0]?.state, 'done');
    assert.equal(waiting[1]?.state, 'done');
    assert.equal(waiting[2]?.state, 'current');
    assert.equal(waiting[3]?.state, 'todo');
    assert.equal(waiting[4]?.state, 'todo');

    const ready = buildCanveloIndicators('pilot_ready');
    assert.ok(ready.every((step, index) =>
      index < 4 ? step.state === 'done' : step.state === 'current',
    ));
  });

  it('exposes Inbox sections Nové / Čeká na odpověď / Nepřiřazené / Archiv', () => {
    assert.deepEqual(
      PILOT_INBOX_SECTIONS.map((section) => section.label),
      ['Nové', 'Čeká na odpověď', 'Nepřiřazené', 'Archiv'],
    );
  });

  it('wires five terminal views including Canvelo Výpis', () => {
    const terminal = read('features/pilot-workspace/PilotWorkingTerminal.tsx');
    const listing = read(
      'features/pilot-workspace/terminal/PilotTerminalListing.tsx',
    );
    const inbox = read(
      'features/pilot-workspace/terminal/PilotTerminalInbox.tsx',
    );
    const detail = read(
      'features/pilot-workspace/terminal/PilotTerminalDetail.tsx',
    );
    const timeline = read(
      'features/pilot-workspace/terminal/PilotTerminalTimeline.tsx',
    );
    const workflow = read(
      'features/pilot-workspace/terminal/PilotTerminalWorkflow.tsx',
    );
    const css = read('index.css');

    assert.match(terminal, /PilotTerminalListing/);
    assert.match(terminal, /PilotTerminalDetail/);
    assert.match(terminal, /PilotTerminalInbox/);
    assert.match(terminal, /PilotTerminalTimeline/);
    assert.match(terminal, /PilotTerminalWorkflow/);

    assert.match(listing, /data-canvelo/);
    assert.match(listing, /buildCanveloIndicators/);
    assert.match(listing, /office-pilot-canvelo/);
    assert.doesNotMatch(listing, /progress-bar/i);
    assert.doesNotMatch(listing, /metric-card/i);
    assert.doesNotMatch(listing, /PlatformCard/);

    assert.match(inbox, /data-inbox-runtime/);
    assert.match(inbox, /PILOT_INBOX_CATEGORIES/);
    assert.match(inbox, /data-pilot-inbox-default/);
    assert.match(inbox, /pilot-inbox-assignment/);
    assert.match(detail, /pilot-detail-firma/);
    assert.match(detail, /pilot-detail-kontakty/);
    assert.match(detail, /pilot-detail-balicek/);
    assert.match(detail, /pilot-detail-licence/);
    assert.match(detail, /pilot-detail-stav/);
    assert.match(detail, /pilot-detail-partner-environment/);
    assert.match(timeline, /data-timeline-runtime/);
    assert.match(timeline, /pilot-timeline-list/);
    assert.match(timeline, /pilot-timeline-event-detail/);
    assert.match(workflow, /data-workflow-runtime/);
    assert.match(workflow, /pilot-workflow-board/);
    assert.match(css, /office-pilot-canvelo__step/);
    assert.doesNotMatch(css, /progress-bar/);
  });
});
