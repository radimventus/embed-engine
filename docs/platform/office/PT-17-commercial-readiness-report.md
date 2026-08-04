# PT-17 — Commercial Readiness / Pilot Readiness Report

Generated: 2026-08-04T18:12:44.025Z

## Overall

**PASS** — Commercial Readiness Score **100/100**.

Platforma je připravena na první pilotní nasazení commercial runtime.

---

## 1. End-to-End Validation Report

Offer → Order → Documents → Conversation → Mail → Timeline → Office Tasks → Workflow → Pilot Ready.

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
| e2e-lifecycle | End-to-End Commercial Lifecycle | **PASS** | events=OfferAccepted,OrderConfirmed,PaymentConfirmed,PilotReady |
| documents | Document Runtime | **PASS** | documents=5 |
| mail-session | Mail Session | **PASS** | intents=2 failures=0 |

Snapshot:

- projectId: `case-pt17-readiness`
- events: OfferAccepted → OrderConfirmed → PaymentConfirmed → PilotReady
- documents: 5
- mail intents: 2

---

## 2. Runtime Consistency Report

Cross-check: Workflow · Business Automation · Document Runtime · Conversation · Mail Session · Timeline · Office Tasks.

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
| conversation-timeline | Conversation · Timeline | **PASS** | kinds=office.task,note.added,workflow.synced,order.confirmed,document.generated,document.attached,document.sent,payment.received,builder.ready |
| office-tasks | Office Task Runtime | **PASS** | open=waiting_review,waiting_send,waiting_builder |
| workflow-sync | Workflow Synchronization | **PASS** | status=pilot_ready active=builder |

- syncedStatus: `pilot_ready`
- workflowActiveStepId: `builder`
- open tasks: waiting_review, waiting_send, waiting_builder
- timeline kinds: office.task, note.added, workflow.synced, order.confirmed, document.generated, document.attached, document.sent, payment.received, builder.ready

---

## 3. Failure Scenario Report

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
| failure-mail | Failure · unsuccessful mail send | **PASS** | failures=1 status=checkout |
| failure-missing-doc | Failure · missing document (no GenerateDocument) | **PASS** | docs=0 status=paid |
| failure-duplicate-event | Failure · duplicate Business Event / repeated action | **PASS** | openSend=1 orderVersions=2,1 docs=10 |
| failure-workflow-interrupt | Failure · Workflow interruption mid-path | **PASS** | afterOrder=waiting_payment afterInterrupt=waiting_payment final=pilot_ready docs=5 |

---

## 4. Pilot Readiness Report

### Commercial Readiness Score

**100/100** (10/10 areas PASS)

### Findings (operational audit)

- Mail send failure is journaled; Workflow · Tasks · Conversation remain synced.
- Duplicate OrderConfirmed re-versions documents and keeps a single open waiting_send task.
- WorkflowMessageReceived mid-path does not regress status; lifecycle resumes to Pilot Ready.
- Identifikátory: BusinessEvent.id, DocumentArtifact.id, OfficeTask.id, Timeline event id — auditovatelná stopa.
- Stavové přechody: offer→checkout→waiting_payment→paid→pilot_ready přes commercialWorkflowSync.
- Názvosloví Business Event / Automation Action / Office Task kind je stabilní katalog.
- Commercial Readiness Score: 100/100 (10/10 areas PASS).

### Recommendations before first pilot

- Pilot s provozním (non-production) Mail Session a ověřeným SMTP před prvním živým odesláním.
- Sledovat journal mailFailures / documentFailures v Office Automation hostu.
- Duplicitní OrderConfirmed je bezpečný (verze dokumentů); operátor nemá opakovat ručně bez důvodu.
- Přerušení Workflow (Inbox message) nesmí regressovat commercial status — ověřeno.
- Builder implementace zůstává mimo scope — Office Task „Čeká na Builder“ je handoff signál.
- Bankovní párování / CRM / webhooky / scheduler nejsou součástí pilotní brány.

### Blockers

- Žádné kritické blokující chyby.

### Full area matrix

| ID | Area | Verdict | Detail |
| --- | --- | --- | --- |
| e2e-lifecycle | End-to-End Commercial Lifecycle | **PASS** | events=OfferAccepted,OrderConfirmed,PaymentConfirmed,PilotReady |
| documents | Document Runtime | **PASS** | documents=5 |
| conversation-timeline | Conversation · Timeline | **PASS** | kinds=office.task,note.added,workflow.synced,order.confirmed,document.generated,document.attached,document.sent,payment.received,builder.ready |
| office-tasks | Office Task Runtime | **PASS** | open=waiting_review,waiting_send,waiting_builder |
| workflow-sync | Workflow Synchronization | **PASS** | status=pilot_ready active=builder |
| mail-session | Mail Session | **PASS** | intents=2 failures=0 |
| failure-mail | Failure · unsuccessful mail send | **PASS** | failures=1 status=checkout |
| failure-missing-doc | Failure · missing document (no GenerateDocument) | **PASS** | docs=0 status=paid |
| failure-duplicate-event | Failure · duplicate Business Event / repeated action | **PASS** | openSend=1 orderVersions=2,1 docs=10 |
| failure-workflow-interrupt | Failure · Workflow interruption mid-path | **PASS** | afterOrder=waiting_payment afterInterrupt=waiting_payment final=pilot_ready docs=5 |

---

## Scope note

Validation only. Out of scope: bank pairing, AI, CRM, webhooks, scheduler, Builder implementation, UI redesign.
