# Pilot Review

Post-execution review of the first CONIS commercial pilot (PT-19).  
Partner: **Domy s energií** (`p-dse`). Deployment: **only** PT-18 Deployment Package.

## What worked

- Deployment Package was sufficient — no undocumented deployment steps were invented.
- End-to-end path **Lead → Offer → Order → Documents → Payment → Conversation → Timeline → Office → Pilot Ready** completed without critical platform code changes.
- Document Runtime issued the electronic-order package and attached artifacts to Conversation.
- Business Automation orchestrated GenerateDocument · NotifyOffice · mail intents · workflow sync.
- Failure behaviours (mail fail, duplicate event, workflow interrupt) stayed consistent (PT-17).
- Office Detail showed synced status and project-bound tasks/documents.

## What required intervention

| Situation | Intervention | Critical? |
| --- | --- | --- |
| Payment confirmation | External finance confirmation → publish `PaymentConfirmed` | No (expected; no bank pairing) |
| Live mailbox cutover | Operator sets `SMTP_*` / `IMAP_*` + DNS per checklist | No (documented) |
| Branding confirmation | Confirm labels in configuration before Offer go-live | No (documented) |
| Builder work | Office Task handoff only | No (out of scope) |

No emergency Runtime hotfixes were required to finish the commercial path.

## What the partner valued positively

| Theme | Partner signal |
| --- | --- |
| Clarity of commercial path | Offer → Order → documents felt like one continuous deal, not a set of disconnected tools |
| Contract package | Receiving the electronic-order set (order + framework + DPA/VOP/standard) together built trust |
| Office visibility | Ability for CONIS operators to see Timeline / Tasks / status without asking the partner for screenshots |
| Predictable next steps | Waiting states (`payment` / `Builder` handoff) made ownership clear even when Builder is external |

## What must improve

- Persist Conversation / Documents / Tasks across restarts (F-02 → Critical).
- Unify Offer → Office Automation event bus (F-01).
- Harden live mail cutover (MX/SPF smoke) (F-03).
- Payment confirmation SOP until bank pairing (F-04).
- Operator SSOT for Documents (F-06) and PDF fidelity (F-11).
- Partner-facing task copy (F-08).

## Recommendations for GM-2

1. **Persist** commercial Conversation / Document / Task / Workflow sync state (Critical).
2. **Unify** Offer → Office Automation event bus (or shared host) for production.
3. Harden **live mail cutover** runbook with MX/SPF smoke against partner domain.
4. Define **payment confirmation** SOP until bank pairing exists.
5. Clarify **Documents Workspace** vs Document Runtime SSOT for operators.
6. Improve PDF/invoice presentation when commercial contracts demand it.

See [GM-2 Prioritized Backlog](./gm2-prioritized-backlog.md).
