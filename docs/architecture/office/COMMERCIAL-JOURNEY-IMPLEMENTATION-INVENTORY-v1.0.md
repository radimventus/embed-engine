# COMMERCIAL JOURNEY IMPLEMENTATION INVENTORY v1.0

**Status:** Reference SSOT — Commercial Journey audit *(ready for Product Review freeze)*  
**Living roadmap:** [OFFICE ROADMAP v2.0](./OFFICE-ROADMAP-v2.0.md) §8.1  
**Branch:** `feature/cap-p04-founding-partner`  
**Payment HEAD:** `7c26352` — `feat(commercial): implement payment experience`  
**Date:** 2026-08-05  
**Scope:** Partner-facing Commercial Journey v1.0 (PT-CJ-00…PT-CJ-05)  
**Method:** Commit history × validation reports × Working Terminal screens × workflow catalog  
**Constraint:** Finalization audit — no Business Automation · no SMTP/IMAP · no bank settlement

---

## 0. Executive verdict

| Gate | Result |
| --- | --- |
| Lean five-step partner path implemented | PASS |
| Screens match workflow catalog (no orphans) | PASS |
| No Office Handoff / Pilot Confirmed in partner path | PASS |
| 1 EPIC ≈ 1 Commit (through payment) | PASS |
| Visual + UX continuity (Apple Easy) | PASS (pending Product Review) |
| Roadmap ↔ implementation sync | PASS (this inventory + OFFICE ROADMAP §8.1) |
| Clean tree for CJ-only close | HOLD — unrelated Office WIP must stay out of CJ commit |

**Overall:** **READY FOR PRODUCT REVIEW** — Commercial Journey v1.0 as one product whole.

---

## 1. Canonical partner path

```text
Vítejte
  → Pilotní program
  → Dokončit objednávku
  → Platba
  → CONIS Studio
```

| Step | Label | Screen | Primary CTA |
| --- | --- | --- | --- |
| `welcome` | Vítejte | `CommercialJourneyScreen` Welcome | Vybrat pilotní program |
| `pilot_program` | Pilotní program | `PilotProgramScreen` | Pokračovat |
| `complete_order` | Dokončit objednávku | `CompleteOrderScreen` | Potvrdit objednávku |
| `payment` | Platba | `PaymentScreen` | Potvrdit provedení QR platby |
| `conis_studio` | CONIS Studio | `ConisStudioScreen` | Otevřít CONIS Studio |

**Not partner steps:** Office Handoff, Pilot Confirmed, internal Office Workflow.

---

## 2. Naming (SSOT)

| Term | Meaning |
| --- | --- |
| **Commercial Journey** | Partner purchase path (five steps above) — production preview in Office Working Terminal |
| **Office Pilot Journey (OF-06)** | Office-side E2E commercial validation — **not** the partner purchase UI |
| **Partner Journey (PE spine)** | Provisioning → NDA → delivery → follow-up → welcome → lifecycle → administration |

Do not conflate these three.

---

## 3. Roadmap ↔ commit inventory

| EPIC | Intent | Commit | Status |
| --- | --- | --- | --- |
| PT-CJ-00 Pilot Delivery | Entry package | `0d93a5f` | Closed |
| PT-CJ-01 Welcome & Pilot Entry | Welcome + entry | `c301e90` | Closed |
| PT-CJ-OS-01 CJ Runtime | Office preview mode | `ab2b30d` | Closed |
| PT-CJ-02 Lean Journey + Pilot Program | 5-step path + PDF catalog | `f39b242` | Closed |
| PT-CJ-03 Complete Order | Electronic order | `6b576a2` | Closed |
| PT-CJ-04 Payment Experience | Proforma + QR + confirm | `7c26352` | Closed |
| PT-CJ-04 Completion *(polish)* | Final copy + visual unify | Folded into PT-CJ-05 | Hold → finalize commit |
| PT-CJ-05 Finalization | Inventory · Visual/UX · docs | Pending Product Review | Hold |

**Deviation:** Two Product Tokens shared **PT-CJ-04** (Payment vs Completion). Completion polish is absorbed by **PT-CJ-05** finalize commit — do not renumber history.

---

## 4. Surface map (no orphans / no duplicates)

### Partner production screens (Working Terminal)

Only these five CJ screens are partner steps:

- `CommercialJourneyScreen.tsx` (Welcome + router)
- `PilotProgramScreen.tsx`
- `CompleteOrderScreen.tsx`
- `PaymentScreen.tsx`
- `ConisStudioScreen.tsx`

### Developer / Office surfaces (not CJ steps)

Inbox, Timeline, Detail, Mail Composer, Document Viewer, Office Tasks — remain Office tools; **not** Commercial Journey steps.

### Catalog SSOT

`COMMERCIAL_JOURNEY_STEP_DEFS` in `commercialJourneyModel.ts` is the single step list. Workflow navigator + terminal both consume it.

---

## 5. Visual / UX Review (self-check)

| Check | Result |
| --- | --- |
| Shared navy / gold tokens across steps | PASS |
| One primary CTA class (`office-cj-pilot__continue`) | PASS |
| Panel radius / spacing unified | PASS |
| Enter transition shared | PASS |
| Welcome ↔ CONIS Studio bookend layout | PASS |
| One job per screen · Apple Easy | PASS |
| Minimum text · no marketing slogans | PASS |
| No internal Office copy on partner screens | PASS |

---

## 6. Out of scope (explicit)

Business Automation · SMTP · IMAP · bank payment verification · internal Office Workflow · Builder.

---

## 7. Acceptance checklist (PT-CJ-05)

- [x] Full path order verified
- [x] Texts / CTAs / navigation mapped
- [x] No orphan partner screens
- [x] No duplicate commercial steps
- [x] Inventory ↔ commits
- [x] OFFICE ROADMAP append §8.1
- [x] PLATFORM ROADMAP SSOT regenerated
- [ ] Product Review PASS
- [ ] Finalize commit `chore(commercial): finalize commercial journey v1.0`

---

## Freeze / handoff

After Product Review **PASS**, freeze this inventory as audit artifact (do not rewrite). Living updates append only to OFFICE ROADMAP + regenerate PLATFORM ROADMAP.docx.

---

*End of COMMERCIAL JOURNEY IMPLEMENTATION INVENTORY v1.0.*
