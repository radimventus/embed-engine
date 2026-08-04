# Pilot Review

Post-execution review of the first CONIS commercial pilot (PT-19).

## What worked

- Deployment Package (PT-18) was sufficient to configure the reference partner without inventing steps.
- End-to-end commercial path **Offer → Order → Documents → Payment → Conversation → Timeline → Office Tasks → Pilot Ready** completed without critical platform code changes.
- Document Runtime issued the electronic-order package and attached artifacts to Conversation.
- Business Automation orchestrated GenerateDocument · NotifyOffice · mail intents · workflow sync.
- Failure behaviours (mail fail, duplicate event, workflow interrupt) stayed consistent (PT-17).
- Office Detail showed synced status and project-bound tasks/documents.

## What did not work / limitations

- Persistence of Conversation / Documents / Tasks is not durable across process restarts (F-02).
- Offer host does not share the Office Automation singleton — live Offer must be wired or events mirrored (F-01).
- Real bank payment confirmation is not automated (F-04).
- Builder handoff stops at Office Task — no Builder product step (F-05).
- PDF visual quality is operational, not print-perfect (F-11).

## What required manual handling

| Situation | Manual action |
| --- | --- |
| Payment confirmation | External finance confirmation → publish `PaymentConfirmed` |
| Live mailbox cutover | Operator sets `SMTP_*` / `IMAP_*` + DNS (Deployment Checklist D/E) |
| Partner-facing brand polish | Confirm branding labels in configuration before Offer go-live |
| Builder work | Tracked as Office Task only; executed outside Runtime |

No emergency Runtime hotfixes were required to finish the commercial path.

## Recommendations for GM-2

1. **Persist** commercial Conversation / Document / Task / Workflow sync state (Critical).
2. **Unify** Offer → Office Automation event bus (or shared host) for production.
3. Harden **live mail cutover** runbook with MX/SPF smoke against partner domain.
4. Define **payment confirmation** SOP until bank pairing exists.
5. Clarify **Documents Workspace** vs Document Runtime SSOT for operators.
6. Improve PDF/invoice presentation when commercial contracts demand it.

See [GM-2 Prioritized Backlog](./gm2-prioritized-backlog.md).
