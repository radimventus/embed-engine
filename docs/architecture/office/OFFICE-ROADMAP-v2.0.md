# OFFICE ROADMAP v2.0

**Status:** Canonical SSOT — Office Studio implementation roadmap  
**Based on:** [OFFICE IMPLEMENTATION INVENTORY v1.0](./OFFICE-IMPLEMENTATION-INVENTORY-v1.0.md) (frozen audit artifact)  
**Branch baseline:** `feature/cap-p04-founding-partner` @ `1f5a873`  
**Office Studio:** **v1.0** (implementation baseline complete)  
**Date:** 2026-08-03  
**Scope:** Documentation synchronization with final implementation — no Git history rewrite, no implementation changes

---

## 0. Purpose

This document is the **single source of truth** for the Office Studio implementation roadmap and the **Office Studio v1.0** reference baseline.

| Artifact | Role |
| --- | --- |
| `OFFICE-IMPLEMENTATION-INVENTORY-v1.0.md` | Frozen audit artifact (cut-off at PE-10) |
| **`OFFICE-ROADMAP-v2.0.md` (this file)** | Living SSOT + immutable completed history + **OFFICE BASELINE v1.0** |

Inventory v1.0 remains unchanged as an audit. Future epics may **only append** to this roadmap.

---

## 1. Inventory Freeze

The document:

`docs/architecture/office/OFFICE-IMPLEMENTATION-INVENTORY-v1.0.md`

is a **frozen audit artifact**.

- Do not rewrite it.
- Do not rename it.
- Do not treat it as the living roadmap.

Living SSOT after Inventory cut-off: **this Roadmap v2.0**.

---

## 2. Consolidation decisions (documentation only)

| Decision | Topic | Resolution |
| --- | --- | --- |
| **Cancel number** | PE-01 | Never existed as a commit. Do not reopen. |
| **Unify naming** | PE-06 / PE-07 | **PE-06 Pilot Delivery** · **PE-07 Pilot Delivery Finalize** |
| **PE-09** | Offer | **PE-09 Pilot Offer & Checkout** — closed (`ae3066d`). Early “PE-09 Commercial Follow-up” was PE-08 — retired. |
| **Actual close order** | PE-09 / PE-10 | Git close order: **PE-10 → PE-09 → PE-11 → PE-12**. Do not renumber. |
| **PE-11** | Lifecycle | **PE-11 Partner Environment Lifecycle** (`466f7b5`). Plan title “Welcome Experience” for PE-11 is retired. |
| **PE-12** | Administration | **PE-12 Partner Administration** (`1f5a873`) — closes Office Studio v1.0 implementation series. |
| **OF-06 name** | Journey | Canonical module name: **Office Pilot Journey**. Commit subject remains historical (`Pilot Runtime`). |
| **Out of v1.0** | Welcome Experience WIP · OF-08 | Not part of Office Studio v1.0 closed set. Welcome Experience = dirty WIP (ID TBD). OF-08 = Quarantine. |

---

## 3. Status board

### ✅ Dokončeno — Office Studio v1.0

Completed in **actual Git chronological close order** (immutable):

1. OF-01 Office Shell — `6a1a8b5`  
2. OF-02 Partner Workspace — `b1a2c94`  
3. OF-03 Sales Workspace — `5044ca2`  
4. OF-04 Document Workspace — `ef4857e`  
5. OF-05 Builder Handoff — `3d339fd`  
6. OF-06 Office Pilot Journey — `dfa124c`  
7. OF-07 Identity & Access — `3fb1fe9`  
8. CS-01 Pilot Partner Provisioning — `b4741a0`  
9. PE-02 Brand Projection — `b7fe956`  
10. PE-03 Pilot Workspace — `ea0f6cb`  
11. PE-04 Invitation & NDA — `dede2fd`  
12. PE-05 Welcome Journey — `8038d04`  
13. PE-06 Pilot Delivery — `945ba84`  
14. PE-07 Pilot Delivery Finalize — `9be34a9`  
15. PE-08 Commercial Follow-up — `21b2706`  
16. PE-10 Partner Environment Provisioning — `2ea815f`  
17. PE-09 Pilot Offer & Checkout — `ae3066d`  
18. PE-11 Partner Environment Lifecycle — `466f7b5`  
19. PE-12 Partner Administration — `1f5a873`  

### 🟡 Mimo Office Studio v1.0 (neuzavřené)

| Item | Notes |
| --- | --- |
| Welcome Experience | Dirty working tree; evolves PE-05; **epic ID TBD** (append-only at future close) |
| OF-08 Operations / AI | **Quarantine** — untracked WIP; reopen only by explicit PT |

### ❌ Cancelled / retired

| ID / label | Decision |
| --- | --- |
| PE-01 | Cancelled — never committed |
| “PE-09 Commercial Follow-up” | Retired alias of PE-08 |
| “PE-11 Welcome Experience” | Retired as PE-11 title |
| “Pilot Runtime” as module name | Retired — use **Office Pilot Journey** (OF-06) |

---

## 4. Canonical Naming

Use **only** these names for Office Studio v1.0 references. Historical commit subjects are not renamed in Git.

### 4.1 Office modules & epics

| Canonical Name | EPIC | Description |
| --- | --- | --- |
| **Office Studio** | — | CONIS commercial control plane (`apps/office-studio`) |
| **Office Shell** | OF-01 | Routing, left nav, dashboard frame |
| **Partner Workspace** | OF-02 | Partner Registry, Detail, Timeline, filters |
| **Sales Workspace** | OF-03 | Commercial pipeline / offer foundation |
| **Document Workspace** | OF-04 | Document package, click-wrap, proforma |
| **Builder Handoff** | OF-05 | Office → Builder bridge |
| **Office Pilot Journey** | OF-06 | End-to-end Office commercial validation journey |
| **Identity & Access** | OF-07 | Platform identity, invitation, auth, roles |
| **Pilot Partner Provisioning** | CS-01 | One-click prepare-pilot orchestration |
| **Brand Projection** | PE-02 | Partner brand into partner studios |
| **Pilot Workspace** | PE-03 | Sample project + Client/Manager/Sales readiness |
| **Invitation & NDA** | PE-04 | Invite, NDA, first password, activation |
| **Welcome Journey** | PE-05 | First-session onboarding after activation |
| **Pilot Delivery** | PE-06 | Delivery package + preview + timeline |
| **Pilot Delivery Finalize** | PE-07 | Deep-link, invitation & activation on package |
| **Commercial Follow-up** | PE-08 | Activity tracking + follow-up status |
| **Pilot Offer & Checkout** | PE-09 | Offer, package comparison, checkout |
| **Partner Environment Provisioning** | PE-10 | One-click Partner Environment creation |
| **Partner Environment Lifecycle** | PE-11 | Active / Suspended / Archived + studio access |
| **Partner Administration** | PE-12 | Profile, package/licence/contact/notes, audit |

### 4.2 Partner Journey (v1.0)

```text
Pilot Partner Provisioning / Partner Environment Provisioning
  → Invitation & NDA
  → Pilot Delivery (+ Pilot Delivery Finalize)
  → Commercial Follow-up
  → Welcome Journey
  → Partner Environment Lifecycle
  → Partner Administration
  → Client Studio / Manager Studio / Sales Studio
```

### 4.3 Surfaces (must not be conflated)

| Canonical Name | Meaning |
| --- | --- |
| **Partner Environment** | Provisioned partner surface (not an Office module name) |
| **Partner Workspace** | OF-02 Office module only |
| **Client Studio** | Partner-accessible experience host |
| **Manager Studio** | Partner-accessible operations studio |
| **Sales Studio** | Partner-accessible sales studio |
| **Builder Studio** | CONIS builder — never partner-primary |
| **Embed Runtime** | Shared Runtime / Decision Layer |

### 4.4 Retired labels (do not use)

| Retired label | Use instead |
| --- | --- |
| Pilot Runtime (as OF-06 module) | Office Pilot Journey |
| PE-09 Commercial Follow-up | Commercial Follow-up (PE-08) |
| PE-11 Welcome Experience | Partner Environment Lifecycle (PE-11) |
| Operations Center (as active) | Quarantined OF-08 — not v1.0 |

---

## 5. Commit inventory (closed epics)

| EPIC | Canonical name | Commit | Product Review | Stav |
| --- | --- | --- | --- | --- |
| OF-01 | Office Shell | `6a1a8b5` | Assumed PASS | ✅ Closed + pushed |
| OF-02 | Partner Workspace | `b1a2c94` | Assumed PASS | ✅ Closed + pushed |
| OF-03 | Sales Workspace | `5044ca2` | Assumed PASS | ✅ Closed + pushed |
| OF-04 | Document Workspace | `ef4857e` | Assumed PASS | ✅ Closed + pushed |
| OF-05 | Builder Handoff | `3d339fd` | Assumed PASS | ✅ Closed + pushed |
| OF-06 | Office Pilot Journey | `dfa124c` | Assumed PASS | ✅ Closed + pushed |
| OF-07 | Identity & Access | `3fb1fe9` | Assumed PASS | ✅ Closed + pushed |
| CS-01 | Pilot Partner Provisioning | `b4741a0` | PASS | ✅ Closed + pushed |
| PE-02 | Brand Projection | `b7fe956` | PASS | ✅ Closed + pushed |
| PE-03 | Pilot Workspace | `ea0f6cb` | PASS | ✅ Closed + pushed |
| PE-04 | Invitation & NDA | `dede2fd` | PASS | ✅ Closed + pushed |
| PE-05 | Welcome Journey | `8038d04` | PASS | ✅ Closed + pushed |
| PE-06 | Pilot Delivery | `945ba84` | PASS | ✅ Closed + pushed |
| PE-07 | Pilot Delivery Finalize | `9be34a9` | PASS | ✅ Closed + pushed |
| PE-08 | Commercial Follow-up | `21b2706` | **PASS** | ✅ Closed + pushed |
| PE-10 | Partner Environment Provisioning | `2ea815f` | **PASS** | ✅ Closed + pushed |
| PE-09 | Pilot Offer & Checkout | `ae3066d` | **PASS** | ✅ Closed + pushed |
| PE-11 | Partner Environment Lifecycle | `466f7b5` | **PASS** | ✅ Closed + pushed |
| PE-12 | Partner Administration | `1f5a873` | **PASS** | ✅ Closed + pushed |

Git history is not rewritten.

---

## 6. Final Architecture Validation

### 6.1 Required separation

```text
Office Studio
    ≠
Builder Studio
    ≠
Partner Environment
    ≠
Embed Runtime
```

| Layer | Meaning | Must not |
| --- | --- | --- |
| **Office Studio** | Commercial CONIS plane | Host Embed Decision Runtime logic |
| **Builder Studio** | Authoring / implementation | Be partner-primary entry |
| **Partner Environment** | Partner surface (provisioning + lifecycle + studios) | Be equated with Partner Workspace (OF-02) |
| **Embed Runtime** | Shared Runtime / Decision Layer | Be modified by Office OF/PE epics |

### 6.2 Validated bridges (allowed)

| Bridge | Direction | Status |
| --- | --- | --- |
| Builder Handoff (OF-05) | Office → Builder | Allowed |
| Partner Environment Provisioning (PE-10) | Office → Partner Environment | Allowed |
| Pilot Offer & Checkout → Lifecycle (PE-09 → PE-11) | Commercial close → Active Partner | Allowed |
| Identity & Access (OF-07) | Shared platform identity | Allowed |

### 6.3 Risks (documented, non-blocking)

| Item | Severity | Notes |
| --- | --- | --- |
| OF-06 commit subject “Pilot Runtime” | Naming | Mitigated by Canonical Naming |
| OF-08 quarantine WIP | Medium | Outside Office Studio v1.0 |
| Welcome Experience dirty tree | Low | Outside Office Studio v1.0; append-only ID later |
| License helper vs OF-08 quarantine | Medium | Technical debt; do not expand until OF-08 reopened |

**Architecture verdict:** **PASS**

---

## 7. Product spine — Office Studio v1.0

```text
Office commercial path
  Office Shell
  → Partner Workspace
  → Sales Workspace / Pilot Offer & Checkout
  → Document Workspace
  → (optional) Builder Handoff
  → Partner Environment Lifecycle
  → Partner Administration

Pilot partner path
  Pilot Partner Provisioning / Partner Environment Provisioning
  → Invitation & NDA
  → Pilot Delivery (+ Finalize)
  → Commercial Follow-up
  → Welcome Journey
  → Partner Environment Lifecycle
  → Partner Administration
  → Client Studio / Manager Studio / Sales Studio

Commercial Journey v1.0 (partner purchase — Working Terminal preview)
  Vítejte
  → Pilotní program
  → Dokončit objednávku
  → Platba
  → CONIS Studio
```

---

## 8. Post-v1.0 delivery (append-only)

Office Studio **v1.0 implementation series is complete**.

### 8.1 Commercial Journey v1.0 (append — 2026-08-05)

**Status:** Implemented · Ready for Product Review finalization (PT-CJ-05)  
**Inventory:** [COMMERCIAL-JOURNEY-IMPLEMENTATION-INVENTORY-v1.0.md](./COMMERCIAL-JOURNEY-IMPLEMENTATION-INVENTORY-v1.0.md)

Partner purchase path (Office Working Terminal production preview):

```text
Vítejte → Pilotní program → Dokončit objednávku → Platba → CONIS Studio
```

| EPIC | Commit |
| --- | --- |
| PT-CJ-00 Pilot Delivery | `0d93a5f` |
| PT-CJ-01 Welcome & Pilot Entry | `c301e90` |
| PT-CJ-OS-01 Commercial Journey Runtime | `ab2b30d` |
| PT-CJ-02 Lean Journey + Pilot Program | `f39b242` |
| PT-CJ-03 Complete Order | `6b576a2` |
| PT-CJ-04 Payment Experience | `7c26352` |
| PT-CJ-05 Finalization | Hold until Product Review PASS |

**Naming:** Commercial Journey ≠ Office Pilot Journey (OF-06) ≠ PE Partner Journey spine.

**Out of CJ v1.0:** Business Automation, SMTP/IMAP, bank settlement verification, Builder.

Future work may only **append** new EPICs after product process (e.g. Pilot Feedback Register → roadmap planning):

1. Welcome Experience — assign next append-only epic ID at close  
2. OF-08 — remains **Quarantine** unless an explicit PT reopens it  
3. Any v1.1+ scope — append only; never renumber closed history  

---

## 9. Freeze Statement

OFFICE ROADMAP v2.0 is the canonical  
implementation roadmap for Office Studio.

Future EPICs may only append to this roadmap.

Existing numbering, naming and completed history  
must remain immutable.

Git history is never rewritten to match documentation.

---

## 10. Document control

| Field | Value |
| --- | --- |
| Title | OFFICE ROADMAP |
| Version | 2.0 |
| Office Studio | **v1.0** |
| Branch baseline | `feature/cap-p04-founding-partner` @ `1f5a873` |
| Classification | Architecture / Office implementation SSOT |
| Does not supersede | OFFICE IMPLEMENTATION INVENTORY v1.0 (frozen audit) |
| Sync PT | DOC-01 — Office Baseline Synchronization |
| Next bump | v2.1 only by appending new epic status rows |

---

## 11. OFFICE BASELINE v1.0

**Status:**  
FROZEN

**Approved:**  
2026-08-03

**Reference:**  
OFFICE ROADMAP v2.0

**Implementation:**  
Git history (`feature/cap-p04-founding-partner` @ `1f5a873`)

Office Studio v1.0 is approved as the canonical implementation baseline.

Future development may only append new EPICs.

Completed implementation history, numbering and naming are immutable.

---

*End of OFFICE ROADMAP v2.0 — Office Studio v1.0 baseline (DOC-01).*
