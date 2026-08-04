# Monitoring Checklist

Operational diagnostics for the first pilot week and every subsequent partner.  
Check at deploy, after first live offer, and daily while the case is open.

Partner / project: ____________ Operator: ____________

For **each** runtime: how to verify · expected state · diagnostic procedure.

## 1. Workflow Runtime

| Field | Content |
| --- | --- |
| **Verification** | Open Office Detail + Workflow navigator for the active `projectId`. Compare synced status to last commercial Business Event. |
| **Expected state** | Status follows `offer → checkout → waiting_payment → paid → pilot_ready`. Active step matches status map. Inbox message does not regress status. |
| **Diagnostic** | If Detail ≠ Automation sync: inspect `commercialWorkflowSync` overlay / last `workflow.synced` Timeline event. Re-publish last known Business Event only after confirming payload `caseId`. |

## 2. Business Automation

| Field | Content |
| --- | --- |
| **Verification** | Publish or observe `OfferAccepted` / `OrderConfirmed` through Office Automation host journal (`conversationEvents`, `workflowPlans`, `mailIntents`, `officeTasks`). |
| **Expected state** | Each event has a non-empty action plan for catalogued kinds. Ports Document · Mail · Tasks · Workflow are notified. Duplicate event keeps a single open task per kind. |
| **Diagnostic** | Empty plan → check event kind catalog / bindings. One port silent → check host wiring. Task storm → inspect Office Task registry for failed dedupe. |

## 3. Mail Session

| Field | Content |
| --- | --- |
| **Verification** | Send supervised SYSTEM mail; sync IMAP; confirm Conversation ingestion. Review `mailFailures` journal. |
| **Expected state** | Outbound message appears in Conversation with unique Message-ID. Replies carry In-Reply-To / References. Document sends include PDF attachments. Failures are journaled without Workflow desync. |
| **Diagnostic** | SMTP errors → env `SMTP_*`, DNS/SPF. Sync empty → `IMAP_*` and mailbox id. Orphan threads → threading headers on compose/reply. |

## 4. Conversation Runtime

| Field | Content |
| --- | --- |
| **Verification** | Select project Inbox / Conversation list; confirm `caseId` binding and message origins (`SYSTEM` / `OFFICE` / `IMAP`). |
| **Expected state** | Project traffic bound to active case — not stranded in Nepřiřazené. Origins labeled. Message-IDs unique. |
| **Diagnostic** | Unassigned mail → mapping rules / explicit `caseId` on SYSTEM send. Duplicate Message-ID → do not resend same id; allocate new. |

## 5. Document Runtime

| Field | Content |
| --- | --- |
| **Verification** | After `OrderConfirmed`, list project documents in Office Document Viewer; confirm Timeline `document.*` events. |
| **Expected state** | Electronic-order package present (≥5 artifacts). Versions increment on re-issue. Conversation attachments present. Office has Preview / Send / Download / History only (no create). |
| **Diagnostic** | Zero docs → missing `caseId`/`projectId` on event or deal package path. Attach missing → Conversation port / mailbox binding. |

## 6. Office Tasks

| Field | Content |
| --- | --- |
| **Verification** | Open project Office Tasks after `OfferAccepted` / `OrderConfirmed` / `PilotReady`. |
| **Expected state** | Tasks bound to `projectId`. Kinds: `waiting_review`, `waiting_send`, `waiting_payment`, `waiting_builder` as applicable. Operator can mark done; Automation does not recreate the same open kind. |
| **Diagnostic** | No tasks → NotifyOffice / CreateBuilderTask ports. Wrong project → payload identity. Duplicates → registry dedupe regression (incident). |

## Cadence

| When | What |
| --- | --- |
| T+0 deploy | Full Deployment Checklist + smoke lifecycle |
| First live Offer | Mail Session · Automation · Timeline · Tasks |
| Daily (open case) | Mail failures · Workflow status · open tasks |
| After PaymentConfirmed | Documents retained · status `paid` → `pilot_ready` |

## Escalation

See [Pilot Operations Handbook](./pilot-handbook.md) — Contact points.
