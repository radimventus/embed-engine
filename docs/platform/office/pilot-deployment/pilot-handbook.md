# Pilot Operations Handbook

Provozní příručka pro první i každý další CONIS commercial pilot.  
Prerequisite: PT-17 Commercial Readiness PASS · this deployment package completed.

**Handover rule:** Another team member must complete onboarding using **only** this package (no oral explanation).

## 1. Deployment procedure

1. Copy [`pilot-configuration.template.json`](./pilot-configuration.template.json) for the partner.
2. Fill identity, platform ids, mailbox, branding, packages ([template guide](./pilot-configuration-template.md)).
3. Set SMTP/IMAP secrets in the deployment environment (never commit).
4. Execute [Deployment Checklist](./deployment-checklist.md) A→I and obtain Go.
5. Open [Monitoring Checklist](./monitoring-checklist.md) for the pilot window.
6. Keep [Rollback Procedure](./rollback-plan.md) linked in the war-room channel.

## 2. Verification steps (smoke)

Use a dedicated smoke project id first (`case-pilot-smoke-*`), not the partner’s live case.

```text
OfferAccepted
  → OrderConfirmed
  → Documents (electronic-order package)
  → Conversation attach
  → Mail Session (SYSTEM)
  → Timeline events
  → Office Tasks
  → Workflow status waiting_payment
  → PaymentConfirmed → paid
  → PilotReady → pilot_ready / Builder step
```

Automated coverage: Office Studio `commercialReadinessValidation` / commercial workflow smoke.

Manual operator checks:

- [ ] Office Detail status matches Automation sync
- [ ] Document Viewer lists issued PDFs
- [ ] Timeline shows `workflow.synced` and `office.task`
- [ ] Mail Composer can reply on the project thread

## 3. First commercial scenario (live)

1. Partner opens Offer with correct branding and package.
2. Partner accepts → operator sees `OfferAccepted` / Order path in Office.
3. Documents appear under the project; primary mail leaves CONIS mailbox.
4. Operator works Office Tasks (`waiting_review` / `waiting_send` / `waiting_payment`).
5. After payment confirmation event → status `paid`.
6. `PilotReady` → handoff task `waiting_builder` (Builder implementation remains out of scope).

Do not invent side channels (personal Gmail, ad-hoc PDFs) for the pilot path.

## 4. Common issues

| Symptom | Likely cause | Action |
| --- | --- | --- |
| No documents after order | Event missing `caseId` / `projectId` | Fix payload; re-publish OrderConfirmed |
| Mail failed, status OK | SMTP down; failure journaled | Fix SMTP; supervised resend from Office |
| Duplicate open tasks | Unexpected — should dedupe by kind | Check task registry; file incident |
| Status stuck on offer | Automation host not receiving Offer events | Verify Offer → Automation bridge |
| Timeline empty | Wrong project selected | Switch active project; refresh Conversation projection |
| Partner sees wrong brand | Configuration branding not applied | Correct config; redeploy Offer surface |
| Deploy broken after release | Bad build / env | [Rollback Procedure](./rollback-plan.md) scenario A |

## 5. Contact points

| Role | Responsibility | Channel |
| --- | --- | --- |
| Pilot operator | Checklist · partner communication · Office | Internal ops |
| Technical on-call | SMTP/IMAP · deploy · rollback | Engineering |
| Commercial lead | Package / pricing confirmation | Sales / founding partner |
| Partner primary contact | From configuration `contactEmail` | Email / phone in config |

Escalate Critical (desync, data risk) to technical on-call **before** changing Runtime code.

## 6. Post-deployment checklist

Complete within 24 hours of Go:

- [ ] Deployment Checklist signed Go / No-Go = Go
- [ ] Smoke project lifecycle completed (Offer → Pilot Ready)
- [ ] Monitoring Checklist opened; Mail + Automation + Document rows green
- [ ] Partner `contactEmail` received at least one supervised SYSTEM mail (or explicit deferral noted)
- [ ] Rollback Procedure link shared with on-call
- [ ] Next operator named for handover (can execute from docs alone)
- [ ] First live Offer window scheduled

## 7. Onboarding without improvisation

Same sequence for **every** partner:

1. Configuration from template  
2. Deployment Checklist Go  
3. Smoke on test project  
4. Monitoring armed  
5. Post-deployment checklist complete  
6. Live Offer  
7. First Order observed in Office  

If a step is unclear, stop and update this handbook — do not invent a one-off procedure.
