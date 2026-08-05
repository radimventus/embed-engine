# PT-COM-01 — Pilot Sales Readiness

**Status:** Verified · Improvement Log open · Ready for Product Review · **Commit:** hold until PASS  
**Depends on:** Commercial Journey v1.0 (`7b00d9c`)  
**Date:** 2026-08-05  
**Scope:** Verify first-sale path · log barriers · no new modules/features/refactors  

**Improvement Log:** [docs/platform/office/improvement-log/](./improvement-log/README.md)

---

## 0. Verdict

| Gate | Result |
| --- | --- |
| Pilot Readiness Review (scenario walked) | PASS (documented) |
| Critical barriers in Improvement Log | PASS · S-001…S-003 Priority 1 |
| Production Readiness (SMTP/IMAP/PDF/QR/login/CJ/Office) | PARTIAL — see §3 |
| Pilot Dry Run | PASS as Office rehearsal · FAIL as external partner |
| Build | PASS |

**Overall:** Ready for first **pilot sales rehearsal**. Not ready for unsupervised external close until **S-001 · S-002 · S-003** are closed or the Manual SOP is used.

---

## 1. Pilot Readiness Review

| Step | Result | Note |
| --- | --- | --- |
| Vytvoření partnera | PASS | Partner Workspace |
| Příprava projektu | PARTIAL | Připravit pilot · S-004 |
| Logo | PARTIAL | Label only · S-005 |
| Hero | PARTIAL | Label only · S-005 |
| Účet + výchozí heslo | PARTIAL | Same-browser only · S-001 |
| Odeslání nabídky | FAIL live | Stub SMTP · S-002 |
| Přihlášení | FAIL live | S-001 |
| Commercial Journey | PARTIAL | Office preview PASS · partner entry S-003 |
| Vstup do CONIS Studio | PARTIAL | After local session / Office CTA |

---

## 2. Barrier Review → Improvement Log

Format: `ID | Priority (1–5) | Oblast | Bariéra | Návrh řešení | Stav`

| ID | Priority | Oblast | Bariéra | Návrh řešení | Stav |
| --- | --- | --- | --- | --- | --- |
| S-001 | 1 | Přihlášení | Identita jen u obchodníka | Durable IAM | Open |
| S-002 | 1 | SMTP | Stub mail — partner nic nedostane | Live SMTP on Odeslat nabídku | Open |
| S-003 | 1 | CJ / Offer | Seed offer místo partnerovy | `/offer/{slug}` per partner | Open |
| S-004 | 2 | Příprava | Provision mizí po refresh | Persist extras | Open |
| S-005 | 2 | Branding | Logo/Hero labely | Real assets nebo neclaim PASS | Open |
| S-006 | 3 | PDF | Web z e-mailové domény | Explicit website field | Open |
| S-007 | 2 | Platba | QR ≠ banka | Finance SOP first 3 pilots | Open |
| S-008 | 3 | Sales UX | Dvě surfaces | Sales playbook | Open |

Detail cards: `improvement-log/S-00*.md`.

---

## 3. Production Readiness

| Area | Ready? | Evidence / gap |
| --- | --- | --- |
| SMTP | **NO** for Partner Workspace send | Stub `createPilotMailSession` · live adapter exists but unused in UI · S-002 |
| IMAP | **NO** for live partner inbox proof | Env adapter Node-only · F-03 |
| PDF | **YES** (artifact) · quality PARTIAL | Document Runtime generates · Hero/logo labels · S-005/S-006 |
| QR | **YES** | SPD QR from proforma · CJ payment screen |
| Přihlášení | **NO** cross-device | Local IAM · S-001 |
| Commercial Journey | **YES** Office preview | Five steps · `7b00d9c` · partner entry S-003 |
| Office Studio | **YES** baseline | v1.0 frozen · partner prep UI works in-session |

---

## 4. Pilot Dry Run

**Role:** salesperson → then partner (external device).

| Act | Observed |
| --- | --- |
| Prepare + preview in Office | Works · credentials shown · PDF built |
| Click Odeslat nabídku | Local success · **no real e-mail** |
| Partner opens mailbox | Empty |
| Partner tries login elsewhere | Credentials unknown |
| Seed path `domy-s-energi` | Offer Experience checkout works |
| Office Working Terminal CJ | Vítejte → … → CONIS Studio works |

**Result:** Last obstacles before first deal = **S-001 · S-002 · S-003** (+ finance SOP **S-007**).

---

## 5. Plán odstranění (first three pilots)

| Order | ID | Action | Blocks sale until |
| --- | --- | --- | --- |
| 1 | S-002 | Live SMTP on offer send | Partner never sees invite |
| 2 | S-001 | Durable partner identity | Partner cannot log in |
| 3 | S-003 | Personalized offer entry | Wrong/missing purchase path |
| 4 | S-007 | Finance SOP (no bank feature) | Trust on “paid” |
| 5 | S-004…S-006, S-008 | After first deal or in parallel if a named deal needs them | Soft friction |

**Until 1–3 land — Manuální SOP:**

1. Připravit partnera v Office.  
2. Zkopírovat login / heslo / Studio link z Delivery Preview.  
3. Odeslat PDF + credentials ručně (real SMTP mimo stub UI).  
4. Demo CJ in Office Terminal **or** seed offer for UX walkthrough.  
5. Confirm payment via bank statement (S-007).  
6. Log outcome in Pilot Feedback Register.

---

## 6. Validation

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

After Product Review **PASS**, prepare commit (docs + Improvement Log only).

---

*End of PT-COM-01.*
