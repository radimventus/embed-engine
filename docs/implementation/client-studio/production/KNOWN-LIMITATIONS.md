# Known Limitations — Client Studio Generation 1

| Field | Value |
| --- | --- |
| **Capability** | CSCB-09 |
| **Date** | 2026-07-22 |

These are **accepted** for pilot — not defects that block CSCB-09.

---

## Product

| ID | Limitation | Mitigation |
| --- | --- | --- |
| KL-AI | AI chat returns placeholder text; no LLM provider | FAQ / intro from Runtime AIContext; disclose in runbook |
| KL-MAIL | Lead transport is mailto only — no CRM | Monitor mailbox; manual follow-up |
| KL-MEDIA | Room media depth incomplete beyond restored hero/floorplan | Graceful media fallbacks; OQ-P03 |
| KL-ANALYTICS | Production analytics is memory-only (no remote sink) | Console in DEV; wire adapter post-RR-001 if needed |
| KL-ERRMON | No remote error monitoring (Sentry etc.) | ErrorBoundary + console diagnostic ids |
| KL-A11Y | Lightbox lacks focus trap; no skip-link | Documented; non-blocking for pilot (see a11y findings) |

---

## Architecture (do not “fix” in Studio)

| Limitation | Owner |
| --- | --- |
| Runtime is certified — Studio must not reinterpret | Runtime / ADR |
| No duplicated Decision Session state in UI | Client Studio invariant |
| Remote feature flags / multi-tenant config absent | Future capability |

---

## Explicit non-goals until RR-001+

- New Experience Surfaces
- Runtime API changes
- Analytics dashboards
- CRM integrations
- Visual redesign
- AI answer quality improvements (CSCB-06 implementation)
