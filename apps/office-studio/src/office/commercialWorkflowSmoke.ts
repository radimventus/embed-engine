/**
 * PT-16 — End-to-end commercial workflow smoke scenario.
 * OfferAccepted → OrderConfirmed → Document · Conversation · Mail · Timeline · Task · Workflow.
 * Uses operational (non-production) mail session — no bank / AI / CRM / webhooks.
 */

import { buildBusinessEvent } from '@embed-engine/business-automation';

import { resetConversationMailStore } from '../mail/conversationMailStore';
import {
  getSyncedWorkflowStatus,
  resetCommercialWorkflowSyncForTests,
  resolveCaseWithWorkflowSync,
} from './commercialWorkflowSync';
import {
  createOfficeAutomationHost,
  resetOfficeAutomationHostForTests,
  type OfficeAutomationHost,
} from './officeAutomationHost';
import { resetAutomationTimelineJournalForTests } from './officeAutomationTimelineJournal';
import {
  listProjectDocuments,
  resetOfficeDocumentRuntimeForTests,
} from './officeDocumentRuntimeHost';
import { resetDocumentTimelineJournalForTests } from './officeDocumentTimelineJournal';
import {
  listOpenOfficeTasksForProject,
  resetOfficeTaskRegistryForTests,
} from './officeTaskRegistry';
import { projectTimelineFromConversation } from './pilotConversationTimeline';
import {
  buildWorkflowSteps,
  type PilotWorkflowStepId,
} from './pilotWorkflowModel';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export const COMMERCIAL_SMOKE_PROJECT_ID = 'case-pt16-smoke';

export type CommercialWorkflowSmokeResult = {
  readonly projectId: string;
  readonly host: OfficeAutomationHost;
  readonly documentCount: number;
  readonly openTaskKinds: readonly string[];
  readonly timelineKinds: readonly string[];
  readonly workflowActiveStepId: PilotWorkflowStepId | null;
  readonly syncedStatus: string | null;
  readonly mailIntentCount: number;
  readonly conversationEventCount: number;
};

function smokeCase(status: PilotWorkspaceCase['status']): PilotWorkspaceCase {
  return {
    id: COMMERCIAL_SMOKE_PROJECT_ID,
    projectId: COMMERCIAL_SMOKE_PROJECT_ID,
    companyId: 'ac-modular',
    label: 'PT-16 Smoke · Starter',
    projectTitle: 'Starter',
    partnerName: 'Domy s energií',
    companyName: 'DSE s.r.o.',
    packageName: 'Starter',
    licenseLabel: 'Smoke',
    logoLabel: '',
    heroLabel: '',
    websiteUrl: '',
    documents: [],
    offerTemplateId: 'template-starter',
    houses: [],
    status,
    updatedAt: '2026-08-04T10:00:00.000Z',
    contacts: [
      {
        name: 'Jana Energetická',
        email: 'jana@domysenergii.cz',
        role: 'Kontakt',
      },
    ],
    partnerEnvironment: {
      state: 'not_prepared',
      label: 'Nepřipraveno',
    },
  };
}

export function resetCommercialWorkflowSmokeForTests(): void {
  resetOfficeAutomationHostForTests();
  resetOfficeDocumentRuntimeForTests();
  resetDocumentTimelineJournalForTests();
  resetAutomationTimelineJournalForTests();
  resetOfficeTaskRegistryForTests();
  resetCommercialWorkflowSyncForTests();
  resetConversationMailStore();
}

/**
 * Runs the PT-16 commercial smoke chain through shared Office Automation host.
 */
export async function runCommercialWorkflowSmoke(): Promise<CommercialWorkflowSmokeResult> {
  resetCommercialWorkflowSmokeForTests();
  const host = createOfficeAutomationHost();
  const projectId = COMMERCIAL_SMOKE_PROJECT_ID;
  const payload = {
    caseId: projectId,
    orderId: 'ORD-PT16',
    partnerName: 'Domy s energií',
    companyName: 'DSE s.r.o.',
    packageName: 'Starter',
    amountCzk: 14_970,
    contactEmail: 'jana@domysenergii.cz',
  } as const;

  await host.runtime.publish(
    buildBusinessEvent({
      kind: 'OfferAccepted',
      source: 'offer-experience',
      correlationId: projectId,
      payload,
    }),
  );

  await host.runtime.publish(
    buildBusinessEvent({
      kind: 'OrderConfirmed',
      source: 'offer-experience',
      correlationId: projectId,
      payload,
    }),
  );

  const docs = listProjectDocuments(projectId);
  const tasks = listOpenOfficeTasksForProject(projectId);
  const timeline = projectTimelineFromConversation(projectId);
  const syncedStatus = getSyncedWorkflowStatus(projectId);
  const projected = resolveCaseWithWorkflowSync(smokeCase('offer'));
  const steps = buildWorkflowSteps(projected);
  const active = steps.find((step) => step.state === 'active');

  return {
    projectId,
    host,
    documentCount: docs.length,
    openTaskKinds: tasks.map((task) => task.kind),
    timelineKinds: timeline.map((event) => event.kind),
    workflowActiveStepId: active?.id ?? null,
    syncedStatus,
    mailIntentCount: host.journal.mailIntents.length,
    conversationEventCount: host.journal.conversationEvents.length,
  };
}
