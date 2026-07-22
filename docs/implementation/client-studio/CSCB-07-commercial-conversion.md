# CSCB-07 — Commercial Conversion

| Field | Value |
| --- | --- |
| **Capability** | CSCB-07 — Commercial Conversion |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement commercial conversion` |

---

## Implementation summary

Commercial Conversion concludes the Decision Journey with a progressive, non-interruptive action surface.

Flow:

1. Journey conclusion hero  
2. Runtime context strip (recommendation / status / focus / priorities) — display only  
3. Configurable CTAs (consultation, offer, meeting, specialist)  
4. Lead form + consent (revealed after CTA)  
5. Mailto transport submission  
6. Success state with next expected step  

No CRM, scoring, eligibility, or Runtime mutation.

---

## Runtime fields consumed

| Field | Use |
| --- | --- |
| `decision.terminal.outcome.recommendation` | Context headline |
| `decision.terminal.outcome.status` | Status label |
| `decision.terminal.outcome.recommendedNextAction` | “Další krok” line |
| `decision.focus.focusRoomName` / `focusReason` | Focus display |
| `decision.priorityIds` | Priority chips (Czech labels) |
| `decision.terminal.id` | Traceability in mailto body |

Projection: `buildConversionRuntimeSnapshot` — pass-through only.

---

## CTA configuration model

`apps/client-studio/src/features/client-studio/pilot/commercialConversion.ts`

```ts
CommercialCta {
  id: 'request-consultation' | 'request-offer' | 'book-meeting' | 'contact-specialist'
  labelCs, descriptionCs, mailtoSubject, successNextStepCs, enabled
}
```

Toggle `enabled` to configure the CTA set without changing UI code.

---

## Submission flow

```text
Select CTA
    │
Lead form (name, email, phone?, method, message?, consent)
    │
Validate (presentation-only)
    │
mailto:?subject=…&body=CTA + contacts + Runtime snapshot + consent
    │
SuccessState (confirmation + CTA next step)
```

`PILOT_FLAGS.leadCaptureMode: 'mailto'` — transport only.

---

## Modified modules

| Module | Role |
| --- | --- |
| `pilot/commercialConversion.ts` | CTA / consent / contact-method config |
| `AuditLeadCapture.tsx` | Section shell (id preserved for nav) |
| `ConversionContextStrip.tsx` | Runtime display strip |
| `ConversionCtaSelect.tsx` | Configurable CTAs |
| `ConversionLeadForm.tsx` | Form + consent + mailto |
| `SuccessState.tsx` | Confirmation + next step |
| `AuditTransition.tsx` | Journey-conclusion copy |
| Removed | Land-audit SituationSelect / AssessmentWorkflow / AuditContact |

---

## Acceptance checklist

- [x] Conversion integrates with Decision Journey  
- [x] Runtime context displayed without reinterpretation  
- [x] Configurable CTA actions  
- [x] Single submission path (mailto)  
- [x] Success state  
- [x] Responsive layouts  
- [x] No Runtime semantics introduced  

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 47/47 |
| Desktop | [assets/cscb-07-conversion-desktop.png](./assets/cscb-07-conversion-desktop.png) |
| Mobile | [assets/cscb-07-conversion-mobile.png](./assets/cscb-07-conversion-mobile.png) |

---

## Follow-up

- Real backend / CRM = out of scope (future transport adapter behind `leadCaptureMode`)  
- Next: **CSCB-06** implementation (AI) or **CSCB-08** analytics / **CSCB-09** production readiness per roadmap
