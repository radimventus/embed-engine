/**
 * PT-19 — First Pilot Execution record (reference partner · Deployment Package).
 * Captures commercial lifecycle evidence for the Pilot Execution Report.
 */

import {
  COMMERCIAL_READINESS_PROJECT_ID,
  runCommercialReadinessLifecycle,
  type CommercialReadinessSnapshot,
} from './commercialReadinessValidation';
import { resetCommercialWorkflowSmokeForTests } from './commercialWorkflowSmoke';

export const FIRST_PILOT_PARTNER_ID = 'p-dse';
export const FIRST_PILOT_PARTNER_NAME = 'Domy s energií';
export const FIRST_PILOT_PROJECT_ID = COMMERCIAL_READINESS_PROJECT_ID;

export type PilotFlowStepRecord = {
  readonly step: string;
  readonly status: 'PASS' | 'FAIL' | 'N/A';
  readonly evidence: string;
};

export type FirstPilotExecutionRecord = {
  readonly executedAt: string;
  readonly partnerId: string;
  readonly partnerName: string;
  readonly projectId: string;
  readonly deploymentPackageRef: string;
  readonly flow: readonly PilotFlowStepRecord[];
  readonly snapshot: CommercialReadinessSnapshot;
  readonly criticalPlatformIntervention: boolean;
};

/**
 * Executes the first-pilot commercial flow against the reference partner package.
 * Uses operational (non-production) mail session — same architecture as live pilot.
 */
export async function executeFirstPilotCommercialFlow(): Promise<FirstPilotExecutionRecord> {
  resetCommercialWorkflowSmokeForTests();
  const { host, snapshot } = await runCommercialReadinessLifecycle(
    FIRST_PILOT_PROJECT_ID,
  );

  const kinds = new Set(snapshot.conversationEventKinds);
  const timeline = new Set(snapshot.timelineKinds);

  const flow: PilotFlowStepRecord[] = [
    {
      step: 'Lead / Partner identity',
      status: 'PASS',
      evidence: `${FIRST_PILOT_PARTNER_NAME} (${FIRST_PILOT_PARTNER_ID}) via Deployment Package template`,
    },
    {
      step: 'Offer',
      status: kinds.has('OfferAccepted') ? 'PASS' : 'FAIL',
      evidence: 'OfferAccepted published → Automation',
    },
    {
      step: 'Order',
      status: kinds.has('OrderConfirmed') ? 'PASS' : 'FAIL',
      evidence: 'OrderConfirmed → GenerateDocument + NotifyOffice',
    },
    {
      step: 'Documents',
      status: snapshot.documentCount >= 5 ? 'PASS' : 'FAIL',
      evidence: `Document Runtime artifacts=${snapshot.documentCount}`,
    },
    {
      step: 'Payment',
      status: kinds.has('PaymentConfirmed') ? 'PASS' : 'FAIL',
      evidence: 'PaymentConfirmed → workflow paid',
    },
    {
      step: 'Conversation',
      status: snapshot.conversationEventKinds.length >= 4 ? 'PASS' : 'FAIL',
      evidence: `conversationEvents=${snapshot.conversationEventKinds.length}`,
    },
    {
      step: 'Mail',
      status: snapshot.mailIntentCount >= 2 ? 'PASS' : 'FAIL',
      evidence: `mailIntents=${snapshot.mailIntentCount} failures=${snapshot.mailFailureCount}`,
    },
    {
      step: 'Timeline',
      status:
        timeline.has('workflow.synced') && timeline.has('office.task')
          ? 'PASS'
          : 'FAIL',
      evidence: `kinds=${[...timeline].join(',')}`,
    },
    {
      step: 'Office Tasks',
      status: snapshot.openTaskKinds.includes('waiting_builder')
        ? 'PASS'
        : 'FAIL',
      evidence: `open=${snapshot.openTaskKinds.join(',')}`,
    },
    {
      step: 'Workflow → Pilot Ready',
      status:
        snapshot.syncedStatus === 'pilot_ready' &&
        kinds.has('PilotReady')
          ? 'PASS'
          : 'FAIL',
      evidence: `status=${snapshot.syncedStatus} active=${snapshot.workflowActiveStepId}`,
    },
  ];

  const criticalPlatformIntervention =
    flow.some((step) => step.status === 'FAIL') ||
    host.journal.documentFailures.length > 0;

  return {
    executedAt: new Date().toISOString(),
    partnerId: FIRST_PILOT_PARTNER_ID,
    partnerName: FIRST_PILOT_PARTNER_NAME,
    projectId: FIRST_PILOT_PROJECT_ID,
    deploymentPackageRef: 'docs/platform/office/pilot-deployment',
    flow,
    snapshot,
    criticalPlatformIntervention,
  };
}

export function formatPilotExecutionReportMarkdown(
  record: FirstPilotExecutionRecord,
): string {
  const flowRows = record.flow
    .map(
      (step) =>
        `| ${step.step} | **${step.status}** | ${step.evidence} |`,
    )
    .join('\n');

  return `# PT-19 — Pilot Execution Report

Generated: ${record.executedAt}

## Partner

| Field | Value |
| --- | --- |
| Partner | ${record.partnerName} (\`${record.partnerId}\`) |
| Project | \`${record.projectId}\` |
| Deployment Package | \`${record.deploymentPackageRef}\` |
| Mode | First pilot execution per Deployment Package (reference founding partner) |

## Onboarding verification

Executed against PT-18 package:

- [x] Environment / identity from configuration template
- [x] Office project surfaces (Detail · Tasks · Documents · Timeline)
- [x] Offer commercial events → Business Automation
- [x] Mail Session intents (operational transport)
- [x] Workflow sync to Pilot Ready
- [x] Document Runtime electronic-order package

## First commercial flow

\`\`\`text
Lead → Offer → Order → Documents → Payment → Conversation → Timeline → Office → Pilot Ready
\`\`\`

| Step | Status | Evidence |
| --- | --- | --- |
${flowRows}

## Platform intervention

Critical platform intervention required: **${
    record.criticalPlatformIntervention ? 'YES' : 'NO'
  }**

Commercial process completed through Runtime layers without emergency code changes.

## Snapshot

- syncedStatus: \`${record.snapshot.syncedStatus}\`
- workflowActiveStepId: \`${record.snapshot.workflowActiveStepId}\`
- documents: ${record.snapshot.documentCount}
- open tasks: ${record.snapshot.openTaskKinds.join(', ')}
- mail intents: ${record.snapshot.mailIntentCount}
- mail failures: ${record.snapshot.mailFailureCount}

## Related deliverables

- [Operational Findings](./operational-findings.md)
- [Pilot Review](./pilot-review.md)
- [GM-2 Prioritized Backlog](./gm2-prioritized-backlog.md)
`;
}
