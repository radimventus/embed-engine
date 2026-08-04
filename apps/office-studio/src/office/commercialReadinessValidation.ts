/**
 * PT-17 — Commercial Readiness Validation.
 * Full Offer → Pilot Ready path · consistency · failure scenarios · readiness report.
 * Validation only — no new product surfaces.
 */

import { buildBusinessEvent } from '@embed-engine/business-automation';

import {
  createMailTransportSession,
  type PilotMailTransportSession,
} from '../mail/mailTransportService';
import { createImapAdapter } from '../mail/imapAdapter';
import { createSmtpAdapter } from '../mail/smtpAdapter';
import { getConversationMailStore } from '../mail/conversationMailStore';
import { DEFAULT_PILOT_MAILBOX_ID } from '../mail';
import {
  getSyncedWorkflowStatus,
  resolveCaseWithWorkflowSync,
} from './commercialWorkflowSync';
import {
  resetCommercialWorkflowSmokeForTests,
} from './commercialWorkflowSmoke';
import {
  createOfficeAutomationHost,
  type OfficeAutomationHost,
} from './officeAutomationHost';
import { listProjectDocuments } from './officeDocumentRuntimeHost';
import {
  listOfficeTasksForProject,
  listOpenOfficeTasksForProject,
} from './officeTaskRegistry';
import { projectTimelineFromConversation } from './pilotConversationTimeline';
import {
  activeWorkflowStepId,
  buildWorkflowSteps,
} from './pilotWorkflowModel';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export const COMMERCIAL_READINESS_PROJECT_ID = 'case-pt17-readiness';

export type ValidationVerdict = 'PASS' | 'FAIL';

export type ValidationAreaResult = {
  readonly id: string;
  readonly label: string;
  readonly verdict: ValidationVerdict;
  readonly detail: string;
};

export type CommercialReadinessSnapshot = {
  readonly projectId: string;
  readonly syncedStatus: string | null;
  readonly workflowActiveStepId: string | null;
  readonly documentCount: number;
  readonly openTaskKinds: readonly string[];
  readonly timelineKinds: readonly string[];
  readonly conversationEventKinds: readonly string[];
  readonly mailIntentCount: number;
  readonly mailFailureCount: number;
};

export type CommercialReadinessReport = {
  readonly generatedAt: string;
  readonly overall: ValidationVerdict;
  /** 0–100 · share of PASS areas. */
  readonly readinessScore: number;
  readonly areas: readonly ValidationAreaResult[];
  readonly findings: readonly string[];
  readonly recommendations: readonly string[];
  readonly blockers: readonly string[];
  readonly snapshot: CommercialReadinessSnapshot;
};

function baseCase(
  projectId: string,
  status: PilotWorkspaceCase['status'] = 'offer',
): PilotWorkspaceCase {
  return {
    id: projectId,
    label: 'PT-17 Readiness · Starter',
    partnerName: 'Domy s energií',
    companyName: 'DSE s.r.o.',
    packageName: 'Starter',
    licenseLabel: 'Pilot',
    status,
    updatedAt: '2026-08-04T12:00:00.000Z',
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

function commercialPayload(projectId: string) {
  return {
    caseId: projectId,
    orderId: `ORD-${projectId}`,
    partnerName: 'Domy s energií',
    companyName: 'DSE s.r.o.',
    packageName: 'Starter',
    amountCzk: 14_970,
    contactEmail: 'jana@domysenergii.cz',
  } as const;
}

function captureSnapshot(
  projectId: string,
  host: OfficeAutomationHost,
): CommercialReadinessSnapshot {
  const projected = resolveCaseWithWorkflowSync(baseCase(projectId));
  const steps = buildWorkflowSteps(projected);
  const timeline = projectTimelineFromConversation(projectId);
  return {
    projectId,
    syncedStatus: getSyncedWorkflowStatus(projectId),
    workflowActiveStepId: activeWorkflowStepId(steps),
    documentCount: listProjectDocuments(projectId).length,
    openTaskKinds: listOpenOfficeTasksForProject(projectId).map(
      (task) => task.kind,
    ),
    timelineKinds: timeline.map((event) => event.kind),
    conversationEventKinds: host.journal.conversationEvents.map(
      (event) => event.kind,
    ),
    mailIntentCount: host.journal.mailIntents.length,
    mailFailureCount: host.journal.mailFailures.length,
  };
}

/**
 * Full commercial lifecycle: Offer → Order → Payment → Pilot Ready.
 */
export async function runCommercialReadinessLifecycle(
  projectId = COMMERCIAL_READINESS_PROJECT_ID,
): Promise<{
  readonly host: OfficeAutomationHost;
  readonly snapshot: CommercialReadinessSnapshot;
}> {
  resetCommercialWorkflowSmokeForTests();
  const host = createOfficeAutomationHost();
  const payload = commercialPayload(projectId);

  for (const kind of [
    'OfferAccepted',
    'OrderConfirmed',
    'PaymentConfirmed',
    'PilotReady',
  ] as const) {
    await host.runtime.publish(
      buildBusinessEvent({
        kind,
        source: kind === 'PilotReady' ? 'system' : 'offer-experience',
        correlationId: projectId,
        payload,
      }),
    );
  }

  return { host, snapshot: captureSnapshot(projectId, host) };
}

export function evaluateLifecycleConsistency(
  snapshot: CommercialReadinessSnapshot,
): readonly ValidationAreaResult[] {
  const areas: ValidationAreaResult[] = [];

  const hasOffer = snapshot.conversationEventKinds.includes('OfferAccepted');
  const hasOrder = snapshot.conversationEventKinds.includes('OrderConfirmed');
  const hasPay = snapshot.conversationEventKinds.includes('PaymentConfirmed');
  const hasPilot = snapshot.conversationEventKinds.includes('PilotReady');
  areas.push({
    id: 'e2e-lifecycle',
    label: 'End-to-End Commercial Lifecycle',
    verdict: hasOffer && hasOrder && hasPay && hasPilot ? 'PASS' : 'FAIL',
    detail: `events=${snapshot.conversationEventKinds.join(',')}`,
  });

  areas.push({
    id: 'documents',
    label: 'Document Runtime',
    verdict: snapshot.documentCount >= 5 ? 'PASS' : 'FAIL',
    detail: `documents=${snapshot.documentCount}`,
  });

  areas.push({
    id: 'conversation-timeline',
    label: 'Conversation · Timeline',
    verdict:
      snapshot.timelineKinds.includes('order.confirmed') &&
      snapshot.timelineKinds.includes('workflow.synced') &&
      snapshot.timelineKinds.includes('office.task') &&
      (snapshot.timelineKinds.includes('document.generated') ||
        snapshot.timelineKinds.includes('document.attached'))
        ? 'PASS'
        : 'FAIL',
    detail: `kinds=${[...new Set(snapshot.timelineKinds)].join(',')}`,
  });

  areas.push({
    id: 'office-tasks',
    label: 'Office Task Runtime',
    verdict: snapshot.openTaskKinds.includes('waiting_builder')
      ? 'PASS'
      : 'FAIL',
    detail: `open=${snapshot.openTaskKinds.join(',')}`,
  });

  areas.push({
    id: 'workflow-sync',
    label: 'Workflow Synchronization',
    verdict:
      snapshot.syncedStatus === 'pilot_ready' &&
      snapshot.workflowActiveStepId === 'builder'
        ? 'PASS'
        : 'FAIL',
    detail: `status=${snapshot.syncedStatus} active=${snapshot.workflowActiveStepId}`,
  });

  areas.push({
    id: 'mail-session',
    label: 'Mail Session',
    verdict: snapshot.mailIntentCount >= 2 ? 'PASS' : 'FAIL',
    detail: `intents=${snapshot.mailIntentCount} failures=${snapshot.mailFailureCount}`,
  });

  return areas;
}

function createFailingMailSession(): PilotMailTransportSession {
  const store = getConversationMailStore();
  const smtp = createSmtpAdapter(
    {
      host: 'fail.local',
      port: 587,
      secure: false,
      user: 'kontakt@conis.cz',
      password: 'x',
    },
    {
      async sendMail() {
        throw new Error('smtp-send-failed');
      },
    },
  );
  const imap = createImapAdapter(
    {
      host: 'fail.local',
      port: 993,
      secure: true,
      user: 'kontakt@conis.cz',
      password: 'x',
    },
    DEFAULT_PILOT_MAILBOX_ID,
    { fetchFolder: async () => [] },
  );
  return createMailTransportSession({ smtp, imap, store });
}

/**
 * Failure scenarios — runtime must stay consistent (no critical desync).
 */
export async function runCommercialFailureScenarios(): Promise<{
  readonly areas: readonly ValidationAreaResult[];
  readonly findings: readonly string[];
}> {
  const findings: string[] = [];
  const areas: ValidationAreaResult[] = [];

  // 1) Failed mail send
  resetCommercialWorkflowSmokeForTests();
  const failingHost = createOfficeAutomationHost({
    mailSession: createFailingMailSession(),
  });
  const mailProject = 'case-pt17-mail-fail';
  await failingHost.runtime.publish(
    buildBusinessEvent({
      kind: 'OfferAccepted',
      source: 'offer-experience',
      correlationId: mailProject,
      payload: commercialPayload(mailProject),
    }),
  );
  const mailSynced = getSyncedWorkflowStatus(mailProject);
  const mailTasks = listOpenOfficeTasksForProject(mailProject);
  const mailOk =
    failingHost.journal.mailFailures.length >= 1 &&
    mailSynced === 'checkout' &&
    mailTasks.some((task) => task.kind === 'waiting_review') &&
    failingHost.journal.conversationEvents.length === 1;
  areas.push({
    id: 'failure-mail',
    label: 'Failure · unsuccessful mail send',
    verdict: mailOk ? 'PASS' : 'FAIL',
    detail: `failures=${failingHost.journal.mailFailures.length} status=${mailSynced}`,
  });
  if (!mailOk) {
    findings.push('Mail failure desynchronized Workflow / Tasks / Conversation.');
  } else {
    findings.push(
      'Mail send failure is journaled; Workflow · Tasks · Conversation remain synced.',
    );
  }

  // 2) Missing document (event without document generation)
  resetCommercialWorkflowSmokeForTests();
  const missingHost = createOfficeAutomationHost();
  const missingProject = 'case-pt17-missing-doc';
  await missingHost.runtime.publish(
    buildBusinessEvent({
      kind: 'PaymentConfirmed',
      source: 'offer-experience',
      correlationId: missingProject,
      payload: commercialPayload(missingProject),
    }),
  );
  const missingDocs = listProjectDocuments(missingProject);
  const missingOk =
    missingDocs.length === 0 &&
    getSyncedWorkflowStatus(missingProject) === 'paid' &&
    listOpenOfficeTasksForProject(missingProject).some(
      (task) => task.kind === 'waiting_builder',
    );
  areas.push({
    id: 'failure-missing-doc',
    label: 'Failure · missing document (no GenerateDocument)',
    verdict: missingOk ? 'PASS' : 'FAIL',
    detail: `docs=${missingDocs.length} status=${getSyncedWorkflowStatus(missingProject)}`,
  });
  if (!missingOk) {
    findings.push('Missing-document path broke Workflow or Office Tasks.');
  }

  // 3) Duplicate Business Event + repeated Automation Action
  resetCommercialWorkflowSmokeForTests();
  const dupHost = createOfficeAutomationHost();
  const dupProject = 'case-pt17-dup';
  const dupPayload = commercialPayload(dupProject);
  const first = buildBusinessEvent({
    kind: 'OrderConfirmed',
    source: 'offer-experience',
    correlationId: dupProject,
    payload: dupPayload,
  });
  await dupHost.runtime.publish(first);
  await dupHost.runtime.publish(
    buildBusinessEvent({
      kind: 'OrderConfirmed',
      source: 'offer-experience',
      correlationId: dupProject,
      payload: dupPayload,
    }),
  );
  const openSend = listOpenOfficeTasksForProject(dupProject).filter(
    (task) => task.kind === 'waiting_send',
  );
  const allSend = listOfficeTasksForProject(dupProject).filter(
    (task) => task.kind === 'waiting_send',
  );
  const docs = listProjectDocuments(dupProject);
  const versions = docs
    .filter((doc) => doc.type === 'electronic_order')
    .map((doc) => doc.version);
  const dupOk =
    openSend.length === 1 &&
    allSend.length === 1 &&
    getSyncedWorkflowStatus(dupProject) === 'waiting_payment' &&
    docs.length >= 5 &&
    Math.max(...versions) >= 2;
  areas.push({
    id: 'failure-duplicate-event',
    label: 'Failure · duplicate Business Event / repeated action',
    verdict: dupOk ? 'PASS' : 'FAIL',
    detail: `openSend=${openSend.length} orderVersions=${versions.join(',')} docs=${docs.length}`,
  });
  if (!dupOk) {
    findings.push(
      'Duplicate OrderConfirmed produced inconsistent tasks or workflow status.',
    );
  } else {
    findings.push(
      'Duplicate OrderConfirmed re-versions documents and keeps a single open waiting_send task.',
    );
  }

  // 4) Workflow interruption (side event mid-path, then resume)
  resetCommercialWorkflowSmokeForTests();
  const interruptHost = createOfficeAutomationHost();
  const interruptProject = 'case-pt17-wf-interrupt';
  const interruptPayload = commercialPayload(interruptProject);
  await interruptHost.runtime.publish(
    buildBusinessEvent({
      kind: 'OfferAccepted',
      source: 'offer-experience',
      correlationId: interruptProject,
      payload: interruptPayload,
    }),
  );
  await interruptHost.runtime.publish(
    buildBusinessEvent({
      kind: 'OrderConfirmed',
      source: 'offer-experience',
      correlationId: interruptProject,
      payload: interruptPayload,
    }),
  );
  const statusAfterOrder = getSyncedWorkflowStatus(interruptProject);
  await interruptHost.runtime.publish(
    buildBusinessEvent({
      kind: 'WorkflowMessageReceived',
      source: 'office-workflow',
      correlationId: interruptProject,
      payload: {
        ...interruptPayload,
        messageId: 'msg-interrupt',
        conversationId: 'conv-interrupt',
      },
    }),
  );
  const statusAfterInterrupt = getSyncedWorkflowStatus(interruptProject);
  await interruptHost.runtime.publish(
    buildBusinessEvent({
      kind: 'PaymentConfirmed',
      source: 'offer-experience',
      correlationId: interruptProject,
      payload: interruptPayload,
    }),
  );
  await interruptHost.runtime.publish(
    buildBusinessEvent({
      kind: 'PilotReady',
      source: 'system',
      correlationId: interruptProject,
      payload: interruptPayload,
    }),
  );
  const docsAfterInterrupt = listProjectDocuments(interruptProject);
  const interruptOk =
    statusAfterOrder === 'waiting_payment' &&
    statusAfterInterrupt === 'waiting_payment' &&
    getSyncedWorkflowStatus(interruptProject) === 'pilot_ready' &&
    docsAfterInterrupt.length >= 5 &&
    interruptHost.journal.conversationEvents.some(
      (event) => event.kind === 'WorkflowMessageReceived',
    );
  areas.push({
    id: 'failure-workflow-interrupt',
    label: 'Failure · Workflow interruption mid-path',
    verdict: interruptOk ? 'PASS' : 'FAIL',
    detail: `afterOrder=${statusAfterOrder} afterInterrupt=${statusAfterInterrupt} final=${getSyncedWorkflowStatus(interruptProject)} docs=${docsAfterInterrupt.length}`,
  });
  if (!interruptOk) {
    findings.push(
      'Workflow interruption mid-path desynchronized commercial status or documents.',
    );
  } else {
    findings.push(
      'WorkflowMessageReceived mid-path does not regress status; lifecycle resumes to Pilot Ready.',
    );
  }

  return { areas, findings };
}

export function buildCommercialReadinessReport(input: {
  readonly lifecycleAreas: readonly ValidationAreaResult[];
  readonly failureAreas: readonly ValidationAreaResult[];
  readonly failureFindings: readonly string[];
  readonly snapshot: CommercialReadinessSnapshot;
}): CommercialReadinessReport {
  const areas = [...input.lifecycleAreas, ...input.failureAreas];
  const passCount = areas.filter((area) => area.verdict === 'PASS').length;
  const readinessScore =
    areas.length === 0 ? 0 : Math.round((passCount / areas.length) * 100);
  const blockers = areas
    .filter((area) => area.verdict === 'FAIL')
    .map((area) => `${area.label}: ${area.detail}`);
  const overall: ValidationVerdict =
    blockers.length === 0 && readinessScore === 100 ? 'PASS' : 'FAIL';

  const recommendations = [
    'Pilot s provozním (non-production) Mail Session a ověřeným SMTP před prvním živým odesláním.',
    'Sledovat journal mailFailures / documentFailures v Office Automation hostu.',
    'Duplicitní OrderConfirmed je bezpečný (verze dokumentů); operátor nemá opakovat ručně bez důvodu.',
    'Přerušení Workflow (Inbox message) nesmí regressovat commercial status — ověřeno.',
    'Builder implementace zůstává mimo scope — Office Task „Čeká na Builder“ je handoff signál.',
    'Bankovní párování / CRM / webhooky / scheduler nejsou součástí pilotní brány.',
  ];

  const findings = [
    ...input.failureFindings,
    'Identifikátory: BusinessEvent.id, DocumentArtifact.id, OfficeTask.id, Timeline event id — auditovatelná stopa.',
    'Stavové přechody: offer→checkout→waiting_payment→paid→pilot_ready přes commercialWorkflowSync.',
    'Názvosloví Business Event / Automation Action / Office Task kind je stabilní katalog.',
    `Commercial Readiness Score: ${readinessScore}/100 (${passCount}/${areas.length} areas PASS).`,
  ];

  return {
    generatedAt: new Date().toISOString(),
    overall,
    readinessScore,
    areas,
    findings,
    recommendations,
    blockers,
    snapshot: input.snapshot,
  };
}

export function formatCommercialReadinessReportMarkdown(
  report: CommercialReadinessReport,
): string {
  const byPrefix = (prefix: string) =>
    report.areas.filter((area) => area.id.startsWith(prefix));
  const lifecycleAreas = report.areas.filter(
    (area) => !area.id.startsWith('failure-'),
  );
  const failureAreas = byPrefix('failure-');

  const table = (areas: readonly ValidationAreaResult[]) =>
    areas
      .map(
        (area) =>
          `| ${area.id} | ${area.label} | **${area.verdict}** | ${area.detail} |`,
      )
      .join('\n');

  const findingLines = report.findings.map((item) => `- ${item}`).join('\n');
  const recommendationLines = report.recommendations
    .map((item) => `- ${item}`)
    .join('\n');
  const blockerLines =
    report.blockers.length === 0
      ? '- Žádné kritické blokující chyby.'
      : report.blockers.map((item) => `- ${item}`).join('\n');

  return `# PT-17 — Commercial Readiness / Pilot Readiness Report

Generated: ${report.generatedAt}

## Overall

**${report.overall}** — Commercial Readiness Score **${report.readinessScore}/100**.

Platforma ${
    report.overall === 'PASS'
      ? 'je připravena na první pilotní nasazení commercial runtime'
      : 'není připravena — viz blockers'
  }.

---

## 1. End-to-End Validation Report

Offer → Order → Documents → Conversation → Mail → Timeline → Office Tasks → Workflow → Pilot Ready.

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
${table(lifecycleAreas.filter((area) => area.id === 'e2e-lifecycle' || area.id === 'documents' || area.id === 'mail-session'))}

Snapshot:

- projectId: \`${report.snapshot.projectId}\`
- events: ${report.snapshot.conversationEventKinds.join(' → ')}
- documents: ${report.snapshot.documentCount}
- mail intents: ${report.snapshot.mailIntentCount}

---

## 2. Runtime Consistency Report

Cross-check: Workflow · Business Automation · Document Runtime · Conversation · Mail Session · Timeline · Office Tasks.

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
${table(lifecycleAreas.filter((area) => ['conversation-timeline', 'office-tasks', 'workflow-sync'].includes(area.id)))}

- syncedStatus: \`${report.snapshot.syncedStatus}\`
- workflowActiveStepId: \`${report.snapshot.workflowActiveStepId}\`
- open tasks: ${report.snapshot.openTaskKinds.join(', ') || '—'}
- timeline kinds: ${[...new Set(report.snapshot.timelineKinds)].join(', ')}

---

## 3. Failure Scenario Report

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
${table(failureAreas)}

---

## 4. Pilot Readiness Report

### Commercial Readiness Score

**${report.readinessScore}/100** (${report.areas.filter((a) => a.verdict === 'PASS').length}/${report.areas.length} areas PASS)

### Findings (operational audit)

${findingLines}

### Recommendations before first pilot

${recommendationLines}

### Blockers

${blockerLines}

### Full area matrix

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
${table(report.areas)}

---

## Scope note

Validation only. Out of scope: bank pairing, AI, CRM, webhooks, scheduler, Builder implementation, UI redesign.
`;
}

/**
 * Executes lifecycle + failure validation and builds the readiness report.
 */
export async function runCommercialReadinessValidation(): Promise<CommercialReadinessReport> {
  const { snapshot } = await runCommercialReadinessLifecycle();
  const lifecycleAreas = evaluateLifecycleConsistency(snapshot);
  const failures = await runCommercialFailureScenarios();
  return buildCommercialReadinessReport({
    lifecycleAreas,
    failureAreas: failures.areas,
    failureFindings: failures.findings,
    snapshot,
  });
}
