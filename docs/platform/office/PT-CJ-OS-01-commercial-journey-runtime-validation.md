# PT-CJ-OS-01 — Commercial Journey Runtime (validation)

**Status:** Ready for Product Review · **Commit:** hold until PASS  
**Scope:** Office Studio production preview mode — navigation + screens only.

## Delivered

| Area | Result |
| --- | --- |
| Commercial Journey mode | `data-office-mode="commercial-journey"` on work surface + Working Terminal |
| Workflow catalog | Welcome → Pilot Program → Order Confirmation → Payment → Pilot Confirmed → Office Handoff |
| Working Terminal | Production partner screens via `CommercialJourneyScreen` (not admin tabs) |
| Step sync | Workflow click → `highlight-step` → Terminal `data-cj-step` + active project |
| Project select | Activates `terminalView: 'journey'` + projects journey steps for case |
| Business logic | None — CTAs disabled; no SMTP/IMAP/QR/BA/state mutation |

## Sync chain

```text
Select Project → activeCase + workflow projection
        ↓
Workflow step click → highlightedStepId
        ↓
Working Terminal → CommercialJourneyScreen(stepId)
```

## Acceptance map

| Criterion | Evidence |
| --- | --- |
| Merchant opens project → sees Commercial Journey | `planPilotProjectActivation` → journey; navigator title Commercial Journey |
| Click steps switches Terminal | `navigateWorkflowStep` + `PilotWorkingTerminal` stepId from `highlightedStepId` |
| Screens are partner production preview | Welcome copy matches PT-CJ-01; CTAs `disabled` |
| Not administration | Terminal no longer mounts Detail/Inbox/Timeline/Workflow tabs |

## Out of scope (unchanged)

SMTP, IMAP, QR, Business Automation, runtime state changes, Office handoff execution, documents.

## Validation commands

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

## Product Review checklist

- [ ] UX: Workflow reads as Commercial Journey (not internal ops)
- [ ] Visual: Welcome / Pilot Program / later steps look partner-facing
- [ ] Navigation: every step switches Terminal content
- [ ] Build PASS
- [ ] No regressions in project select / work surface

After Product Review **PASS**, prepare commit (do not commit in this ticket until then).
