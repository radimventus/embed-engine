# Pilot Runbook — Client Studio

| Field | Value |
| --- | --- |
| **Capability** | CSCB-09 |
| **Audience** | Pilot operators / founding partners |
| **Date** | 2026-07-22 |

---

## Purpose

Operate a controlled external pilot of Client Studio Generation 1 without modifying Runtime semantics.

---

## Before the session

1. Confirm release commit + [Pilot Readiness Checklist](./PILOT-READINESS-CHECKLIST.md) signed off.
2. Confirm pilot URL (HTTPS) and mailbox `kontakt@astav.cz` monitored.
3. Clear browser localStorage on demo device (legacy opt-in risk).
4. Confirm Czech locale copy is expected for the customer.

---

## Guided journey (operator narrative)

```text
Úvod (Hero)
  → Objekt (Property Explorer)
  → Prohlídka (Spatial / Walkthrough)
  → Priorita + Rozhodovací terminál
  → AI (optional — placeholder replies)
  → Audit / Poptávka (mailto)
```

Talk about **buyer decision quality**, not Runtime internals.

---

## During the session

| If… | Then… |
| --- | --- |
| Bootstrap spinner stays >10s | Hard refresh once; if persists, abort and capture version from `dataset.clientStudioVersion` |
| Media missing | Continue — fallback copy is intentional; note room id |
| AI chat replies stub | Explain FAQ answers only; do not invent Runtime claims |
| Mailto fails | Use on-screen fallback address; capture lead manually |
| Browser offline mid-journey | Decision Journey should remain on last projected state; reconnect and refresh if needed |

**Never** enable `legacyCommandRuntime` during a customer session.

---

## After the session

1. Confirm lead arrived (mailto) or was captured manually.
2. Note any blank surfaces, layout jumps, or keyboard issues.
3. File findings against Known Limitations — do not hot-patch Runtime for presentation bugs.
4. If severity is journey-breaking, execute [Rollback Procedure](./ROLLBACK-PROCEDURE.md).

---

## Diagnostics operators may collect

Safe:

- URL + UTC timestamp
- `dataset.clientStudioVersion` / generation
- Browser + OS
- Section id where issue appeared
- Console errors **without** pasting customer form fields

Forbidden:

- Full Runtime state dumps
- Customer email/phone from form fields in shared channels
- Analytics event payloads containing free-text messages

---

## Escalation

1. Presentation / media → Client Studio maintainers
2. Decision semantics wrong → Runtime defect process (RAR / ADR) — not a Studio hotfix
3. Hosting / DNS → deployment owner
