# Rollback Procedure

Rollback restores a **safe operator posture** without destroying partner commercial data  
(conversations, issued documents, timeline audit trail).

## Principles

1. **Partner data is retained** — Conversation messages, Document artifacts, Timeline journals, Office Task history stay intact unless legal deletion is explicitly requested.
2. **Configuration is reversible** — env / DNS / feature flags roll back first; data wipe is last resort.
3. **Offer can be paused independently** of Office inspection.
4. **No silent rewrites** of issued PDFs or Message-IDs.
5. **Return to last known-good state** — previous release tag / commit approved at PT-17 or last signed Go.

## Triggers

| Trigger | Severity | Immediate action |
| --- | --- | --- |
| Deployment fails health checks | High | Stop go-live; keep previous release |
| Wrong partner configuration (email, package, branding) | High | Freeze Offer; correct config; re-verify |
| SMTP/IMAP outage or mass mail failure | High | Disable automated sends; journal failures; keep Workflow sync |
| Automation desync (status ≠ tasks ≠ docs) | Critical | Pause Automation publishes; run consistency smoke; escalate |
| SSL / DNS misconfiguration | High | Revert DNS / cert; Offer offline until green |

## Scenarios

### A. Failed deployment (bad release)

1. Mark Deployment Checklist **No-Go**.
2. Redeploy last known-good commit (PT-17 approved baseline or prior signed Go).
3. Keep partner configuration JSON; do not delete Conversation store / document history.
4. Re-run smoke: OfferAccepted → OrderConfirmed on a **test project id** (not production case).
5. Resume only after Monitoring Checklist Mail + Automation + Document rows are green.

### B. Wrong configuration

1. Disable partner-facing Offer URL or return maintenance page.
2. Correct `pilot-configuration.json` fields (email, package, branding, project ids).
3. Rotate secrets if credentials were exposed (`SMTP_*` / `IMAP_*`).
4. Do **not** delete already-issued documents; issue corrected versions via Document Runtime if needed.
5. Send manual operator note to partner contact if they received wrong mail.

### C. Communication problems (mail)

1. Stop automated `Send*Mail` by keeping Mail Session in operational fail-safe (failures journaled).
2. Continue Document attach + Workflow sync (architecture allows mail failure without desync).
3. Export conversation audit for the project.
4. Fix SMTP/IMAP/DNS; send one supervised SYSTEM mail.
5. Resume Automation mail intents only after supervised send succeeds.

### D. Return to last functional state

1. Identify last signed Go commit / tag from Deployment Checklist archive.
2. Redeploy that artifact; restore env from secrets store snapshot for that Go.
3. Do not replay destructive migrations against partner Conversation / Document stores.
4. Verify with smoke project, then re-enable live Offer.

## What must not be done

- Hard-delete Conversation or Document stores to “fix” a deploy
- Re-use Message-IDs
- Manually invent Workflow status outside Business Events
- Hot-patch Runtime semantics during a live partner session

## Recovery verification

- [ ] Previous release or corrected config is live
- [ ] Offer smoke does not email the real partner until approved
- [ ] Office shows prior project history intact
- [ ] Open Office Tasks remain bound to the same `projectId`
- [ ] Monitoring Checklist signed for Mail + Automation + Workflow + Document Runtime

## Data retention note

Rollback ≠ erasure. Partner data deletion is a separate legal / ops request outside PT-18.
