/**
 * PT-16 — Commercial Workflow Automation integration + smoke tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildBusinessEvent } from '@embed-engine/business-automation';

import {
  COMMERCIAL_SMOKE_PROJECT_ID,
  resetCommercialWorkflowSmokeForTests,
  runCommercialWorkflowSmoke,
} from './commercialWorkflowSmoke';
import { createOfficeAutomationHost } from './officeAutomationHost';
import { getSyncedWorkflowStatus } from './commercialWorkflowSync';
import { listOpenOfficeTasksForProject } from './officeTaskRegistry';
import { projectTimelineFromConversation } from './pilotConversationTimeline';
import { buildWorkflowSteps } from './pilotWorkflowModel';
import { resolveCaseWithWorkflowSync } from './commercialWorkflowSync';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, '..');

function readSrc(relative: string): string {
  return readFileSync(join(srcRoot, relative), 'utf8');
}

describe('PT-16 commercial workflow automation', () => {
  it('runs end-to-end OfferAccepted → OrderConfirmed smoke through all layers', async () => {
    const result = await runCommercialWorkflowSmoke();

    assert.equal(result.projectId, COMMERCIAL_SMOKE_PROJECT_ID);
    assert.equal(result.conversationEventCount, 2);
    assert.ok(result.mailIntentCount >= 1);
    assert.equal(result.documentCount, 5);
    assert.ok(result.openTaskKinds.includes('waiting_review'));
    assert.ok(result.openTaskKinds.includes('waiting_send'));
    assert.equal(result.syncedStatus, 'waiting_payment');
    assert.ok(result.timelineKinds.includes('order.confirmed'));
    assert.ok(result.timelineKinds.includes('document.generated'));
    assert.ok(result.timelineKinds.includes('document.attached'));
    assert.ok(result.timelineKinds.includes('workflow.synced'));
    assert.ok(result.timelineKinds.includes('office.task'));
    assert.ok(
      result.timelineKinds.includes('email.sent') ||
        result.timelineKinds.includes('document.sent'),
    );
    assert.equal(result.workflowActiveStepId, 'payment');
    assert.ok(result.host.journal.officeTasks.length >= 2);
    assert.ok(result.host.journal.documents.length >= 5);
    assert.ok(result.host.journal.mailIntents.length >= 1);
  });

  it('synchronizes PaymentConfirmed → PilotReady without manual refresh', async () => {
    resetCommercialWorkflowSmokeForTests();
    const host = createOfficeAutomationHost();
    const projectId = 'case-pt16-pay';
    const payload = {
      caseId: projectId,
      partnerName: 'Nord',
      contactEmail: 'erik@nordliving.cz',
    };

    await host.runtime.publish(
      buildBusinessEvent({
        kind: 'PaymentConfirmed',
        source: 'offer-experience',
        correlationId: projectId,
        payload,
      }),
    );
    await host.runtime.publish(
      buildBusinessEvent({
        kind: 'PilotReady',
        source: 'system',
        correlationId: projectId,
        payload,
      }),
    );

    assert.equal(getSyncedWorkflowStatus(projectId), 'pilot_ready');
    const tasks = listOpenOfficeTasksForProject(projectId);
    assert.ok(tasks.some((task) => task.kind === 'waiting_builder'));

    const base: PilotWorkspaceCase = {
      id: projectId,
      label: 'Pay smoke',
      partnerName: 'Nord',
      companyName: 'Nord',
      packageName: 'Pilot',
      licenseLabel: '1',
      status: 'offer',
      updatedAt: '2026-08-04T10:00:00.000Z',
      contacts: [],
      partnerEnvironment: {
        state: 'not_prepared',
        label: 'Nepřipraveno',
      },
    };
    const steps = buildWorkflowSteps(resolveCaseWithWorkflowSync(base));
    assert.equal(
      steps.find((step) => step.state === 'active')?.id,
      'conis_studio',
    );

    const timeline = projectTimelineFromConversation(projectId);
    assert.ok(timeline.some((event) => event.kind === 'workflow.synced'));
    assert.ok(timeline.some((event) => event.kind === 'office.task'));
  });

  it('keeps Office UI free of document/task creation and wires viewer surfaces', () => {
    const detail = readSrc(
      'features/pilot-workspace/terminal/PilotTerminalDetail.tsx',
    );
    const tasks = readSrc(
      'features/pilot-workspace/terminal/ProjectOfficeTasks.tsx',
    );
    const host = readSrc('office/officeAutomationHost.ts');
    const smoke = readSrc('office/commercialWorkflowSmoke.ts');

    assert.match(detail, /ProjectOfficeTasks/);
    assert.match(detail, /resolveCaseWithWorkflowSync/);
    assert.doesNotMatch(tasks, /createOfficeTasksForEvent/);
    assert.match(host, /officeTasks/);
    assert.match(host, /applyBusinessEventToWorkflow/);
    assert.match(smoke, /OfferAccepted/);
    assert.match(smoke, /OrderConfirmed/);
  });
});
