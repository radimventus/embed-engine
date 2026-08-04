# PT-18 — Pilot Deployment Package

**Status:** READY  
**Audience:** CONIS operators · founding-partner onboarding  
**Prerequisite:** [PT-17 Commercial Readiness](../PT-17-commercial-readiness-report.md) = PASS (100/100)  
**Scope:** Standardized, repeatable deployment for the first and every following pilot — **not** new product features.

## Deliverables

| Document | Purpose |
| --- | --- |
| [Pilot Configuration Template](./pilot-configuration-template.md) | Partner identity · environment · branding · mailbox · workflow · documents · offers |
| [Configuration JSON template](./pilot-configuration.template.json) | Machine-readable partner package |
| [Deployment Checklist](./deployment-checklist.md) | DNS · SSL · SMTP · IMAP · environment · Office · Offer · Automation Runtime · Document Runtime |
| [Monitoring Checklist](./monitoring-checklist.md) | Verification · expected state · diagnostics per runtime |
| [Rollback Procedure](./rollback-plan.md) | Failed deploy · bad config · mail issues · return to last good state |
| [Pilot Operations Handbook](./pilot-handbook.md) | Deploy · verify · first scenario · issues · contacts · post-deploy checklist |

## How to use for the next partner

1. Copy `pilot-configuration.template.json` → `partners/<partner-id>/pilot-configuration.json`.
2. Fill identity, mailbox, branding, packages.
3. Execute [Deployment Checklist](./deployment-checklist.md) top to bottom.
4. Run smoke verification from the Handbook (Offer → Pilot Ready).
5. Complete Handbook **Post-deployment checklist**.
6. Keep Monitoring Checklist open during the first commercial week.
7. If blocked, follow [Rollback Procedure](./rollback-plan.md) — do not improvise.

**Handover:** A new operator must complete the above from documentation alone.

## Out of scope

AI · CRM · bank pairing · UI redesign · new Runtime features · Builder implementation.
