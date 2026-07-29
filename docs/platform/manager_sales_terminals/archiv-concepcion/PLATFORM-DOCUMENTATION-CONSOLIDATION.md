# Platform Documentation Consolidation Report

**Date:** 2026-07-23  
**Scope:** `docs/platform/` only  
**Mandate:** Curate existing approved architecture — do not redesign it  
**Studio Specifications:** Deferred (out of scope)

---

# 1. Inventory Report

Total tracked files (md / html / docx, excl. `.DS_Store`): **73**

## 1.1 Canonical SSOT set (approved architecture)

| Path | Name | Type | Purpose | State | Recommended action |
|------|------|------|---------|-------|-------------------|
| `ux-sprinty/00_PLATFORM_CONSTITUTION_v2.0.md` | 00 Platform Constitution | Normative SSOT | Mission, values, constitutional principles | Active SSOT (enriched) | Keep; sole Constitution SSOT |
| `ux-sprinty/01_PLATFORM_ARCHITECTURE_v2.1.md` | 01 Platform Architecture | Architecture SSOT | Building blocks Knowledge→…→Human | Active SSOT (enriched) | Keep; sole Architecture SSOT |
| `ux-sprinty/02_PRODUCT_MODEL_v1.0.md` | 02 Product Model | Product SSOT | Platform→Studio→Terminal→Experience… | Active SSOT (light curation) | Keep; Studio purposes deferred |
| `ux-sprinty/03_TERMINAL_FRAMEWORK_v1.0.md` | 03 Terminal Framework | Framework SSOT | Universal Terminal contract | Active SSOT (enriched) | Keep; sole Terminal SSOT |

## 1.2 Root platform corpus

| Path | Type | Purpose | State | Recommended action |
|------|------|---------|-------|-------------------|
| `PLATFORM_CONSTITUTION_v1.0.md` | Historical constitution | English principles / design / evolution | Historical (bannered) | Archive Candidate after provenance period |
| `Platform_Architecture_1.0_Embed_Engine.md` | Meta-architecture draft | Authoring / Runtime / Terminals / Personas | Historical + ADR source | Archive Candidate after ADR extract |
| `Platform_Architecture_1.0_Addendum_Identity_Perspective.md` | Addendum draft | Identity / Permissions / Perspective | Working Draft / Historical | Archive Candidate; Permissions → Open Question |
| `Identity_and_Decision_Continuity_Architecture.md` | Identity draft | L0–L3 continuity | Historical / ADR source | Curated into 01; Archive Candidate |
| `PERSPECTIVE_MODEL_v1.0.md` | Perspective draft | Perspective schema & questions | Historical / ADR source | Curated into 01; Archive Candidate |
| `PROJECTION_ARCHITECTURE_v1.0.md` | Projection draft | Pipeline, may/may-not, grammar | Historical / ADR source | Curated into 01; Archive Candidate |
| `TERMINAL_FRAMEWORK_v1.0.md` | Terminal draft (EN) | Common contract / lifecycle | Historical | Curated into 03; Archive Candidate |
| `TERMINAL_MODEL_v1.0.md` | Terminal draft | SHALL / Interaction Contract | Archive Candidate | Merged into 03 |
| `Terminal_Grammar_1.0.md` | Grammar draft | C/N/I/A + examples | Archive Candidate | Merged into 03 |
| `TERMINAL_FRAMEWORK_v1.0.docx` | Binary twin | Same as md | Supporting | Archive with md twin |
| `OPERATIONS_TERMINAL_v1.0.md` (+ `.docx`) | Studio / terminal product | Manager / Operations Terminal | Studio Spec (defer) | Hold for Studio Specs pass |
| `SALES_TERMINAL_v2.0.md` (+ `.docx`) | Studio / terminal product | Sales Terminal concept | Studio Spec (defer) | Hold |
| `SALES_TERMINAL_UX_BLUEPRINT_v1.0.md` (+ `.docx`) | Studio UX | Sales UX blueprint | Studio Spec (defer) | Hold |
| `OPERATIONS_SALES_TERMINALS_BLUEPRINT_v1.html` | Combined blueprint | Ops + Sales HTML | Studio Spec / Working Draft | Hold |
| `WORKSPACE_OPERATIONS_SALES_v1.0 draft.html` | Workspace draft | Combined workspace | Working Draft | Archive Candidate |
| `preview.html` | Preview artifact | HTML preview | Working Draft | Archive Candidate / tooling |

## 1.3 ux-sprinty (non-archive)

| Path | Type | Purpose | State | Recommended action |
|------|------|---------|-------|-------------------|
| `01_PLATFORM_ARCHITECTURE_v2.0.md` | Superseded SSOT | Earlier architecture | Historical (bannered) | Archive Candidate |
| `01_PLATFORM_ARCHITECTURE_v2.1 (1).md` | Accidental duplicate | Byte twin of v2.1 | Archive Candidate | Deduplicate when archiving |

## 1.4 ux-sprinty/archiv (already archived folder)

| Group | Examples | Type | Purpose | State | Action |
|-------|----------|------|---------|-------|--------|
| ARCH | `ARCH-002_Hranice_produktu.md` | Product boundaries | Studio responsibility matrix | Historical / ADR Candidate | Keep in archive; ADR list |
| MS-* | MS-01…MS-13 (+ html) | Manager Studio UX sprints | Ops screens / prototypes | Historical / Studio Spec source | Hold for Studio Specs; already archived |
| SP-* | SP-01…SP-05 (+ PRT html) | Sprint packs | Ops flows | Historical | Keep archived |
| ONS-* | ONS-MS-01, ONS-SS-*, ONS-SALES-06, ONS-EX-01 | MVP / onboarding specs | Studio MVPs | Historical / Studio Spec | Hold |
| PRT-* | PRT-01…03, PRT-SS-*, PRT-SALES-06 | Prototypes (CZ) | Decision / sales prototypes | Historical | Keep archived |
| SS-01 | `SS-01_Sales_Studio_Foundation.md` | Sales foundation | Sales Studio | Studio Spec source | Hold |

**No document was deleted or moved outside `docs/platform/`.**

---

# 2. Classification Report

| Class | Documents |
|-------|-----------|
| **SSOT** | `00_PLATFORM_CONSTITUTION_v2.0`, `01_PLATFORM_ARCHITECTURE_v2.1`, `02_PRODUCT_MODEL_v1.0`, `03_TERMINAL_FRAMEWORK_v1.0` (all under `ux-sprinty/`) |
| **Working Draft** | Addendum Identity/Perspective; `WORKSPACE_…draft.html`; `preview.html`; `OPERATIONS_SALES_TERMINALS_BLUEPRINT_v1.html` |
| **Historical** | Constitution v1.0; Architecture 1.0; Architecture v2.0; Identity Continuity; Perspective Model; Projection Architecture; root Terminal Framework; (content preserved) |
| **ADR Candidate** | See §4 |
| **Archive Candidate** | See §5 |
| **Studio Spec (deferred)** | Operations Terminal; Sales Terminal v2; Sales UX Blueprint; ONS/MS/SP/SS archive series; ARCH-002 (studio boundaries — also ADR) |

---

# 3. Consolidation Report

## 3.1 What was done

| SSOT | Enrichment source | Added (compatible only) |
|------|-------------------|-------------------------|
| **00 Constitution** | `PLATFORM_CONSTITUTION_v1.0.md` | Expanded IS/NOT; principles 1–12; design rules; evolution rules; constitutional statement |
| **01 Architecture** | Identity Continuity; Perspective Model; Projection Architecture; Arch 1.0 | Identity L0–L3 + evidence/IP/registration; Perspective clarification + question examples; Projection may/may-not + pipeline; shared Decision Sessions note |
| **02 Product Model** | Terminology pass | Explicit Studio by User; Terminal → 03 pointer; Studio Specs deferred; Hero freeze note (pointer only) |
| **03 Terminal Framework** | Terminal Framework/Model/Grammar | SHALL/SHALL NOT; Interaction Channel; richer C/N/I/A; grammar principle; re-render step; design goal |

## 3.2 What was intentionally NOT merged

| Topic | Reason |
|-------|--------|
| Constitution v1 layer model `Authoring→Runtime→Projection→Experience` | Conflicts with 01 stack |
| Identity docs stack ending at Runtime | Conflicts with 01 order |
| Permissions as first-class layer | Not in 01; Open Question |
| ARCH-002 studio purpose statements | Conflict with Product Model / Client Studio meaning; Studio Specs deferred |
| Analytics / AI Terminal as product studios | Not in Product Model studio list |
| Projection Grammar vs Terminal structure ownership rename | Same C/N/I/A; ownership naming Open Question |
| Extended Terminal lifecycle (Resolve Identity…) | Would expand Terminal into Identity/Perspective; Open Question |

## 3.3 Duplication status (definitions)

| Concept | Single SSOT after curation |
|---------|----------------------------|
| Mission / values / constitutional authority | **00** |
| Building blocks & invariants | **01** |
| Product entities (Platform, Studio, …) | **02** |
| Terminal contract & C/N/I/A structure | **03** |

Historical files retain full text with status banners so knowledge is not lost.

## 3.4 Terminology alignment

| Prefer (SSOT) | Avoid as competing SSOT |
|---------------|-------------------------|
| Manager Studio (02) | “Studio Manager” as product name (ARCH-002) — Open Question |
| Terminal (03) | Treating Terminal as independent app |
| Runtime = sole semantic author (00/01) | Local interpretation in UI |
| Projection never creates meaning (01) | “Projection Grammar creates stories” |

---

# 4. ADR Candidate List

*(Do not create ADRs in this pass — inventory only.)*

| ID (proposed) | Decision theme | Evidence in `docs/platform/` | Notes |
|---------------|----------------|------------------------------|-------|
| ADR-C-01 | **Runtime First** | Constitution principles; Sales UX Blueprint; ONS-MS-01 / ONS-SS-01 | Named sparsely; spirit in 00/01 |
| ADR-C-02 | **Projection First / grow by projections** | Constitution statement; Projection Architecture; Arch 1.0 | Closest name: “platform grows by adding projections” |
| ADR-C-03 | **Studio by User** | Product Model §3; ARCH-002 | Named in curation of 02; ARCH-002 conflicts on purposes |
| ADR-C-04 | **Identity Continuity (L0–L3)** | Identity Continuity Architecture | Levels now summarized in 01; full ADR still useful |
| ADR-C-05 | **Perspective ≠ Identity ≠ Permissions** | Perspective Model; Addendum | Permissions layer unresolved |
| ADR-C-06 | **Unified Runtime / shared Decision Sessions** | Platform Architecture 1.0 | Summarized in 01 Runtime note |
| ADR-C-07 | **Terminal-first extensibility** | Terminal Model design goal | Now in 03 §7 |
| ADR-C-08 | **Hero v1.0 Design Freeze** | *Not defined inside `docs/platform/`* | Lives in `docs/architecture/HERO-V1-FREEZE.md` — list for cross-tree ADR backlog |
| ADR-C-09 | **C/N/I/A ownership (Projection vs Terminal)** | Projection Architecture vs Terminal Framework/Grammar | Open Question |
| ADR-C-10 | **Studio boundary matrix** | ARCH-002 | Defer with Studio Specs; ADR if boundaries become platform-level |

---

# 5. Archive Candidate List

*(Prepare only — do not archive in this pass.)*

### High priority (safe to archive after architect ACK)

1. `ux-sprinty/01_PLATFORM_ARCHITECTURE_v2.1 (1).md` — duplicate  
2. `ux-sprinty/01_PLATFORM_ARCHITECTURE_v2.0.md` — superseded  
3. `TERMINAL_MODEL_v1.0.md`  
4. `Terminal_Grammar_1.0.md`  
5. `TERMINAL_FRAMEWORK_v1.0.md` (+ `.docx` twin)  
6. `PLATFORM_CONSTITUTION_v1.0.md`  

### After ADR extract

7. `Platform_Architecture_1.0_Embed_Engine.md`  
8. `Platform_Architecture_1.0_Addendum_Identity_Perspective.md`  
9. `Identity_and_Decision_Continuity_Architecture.md`  
10. `PERSPECTIVE_MODEL_v1.0.md`  
11. `PROJECTION_ARCHITECTURE_v1.0.md`  

### Draft / tooling

12. `WORKSPACE_OPERATIONS_SALES_v1.0 draft.html`  
13. `preview.html`  

### Already under `ux-sprinty/archiv/`

Remain archived; do not re-home in this pass. Studio Specs will mine them later.

### Do **not** archive yet (Studio Spec defer)

- `OPERATIONS_TERMINAL_v1.0.md` (+ docx)  
- `SALES_TERMINAL_v2.0.md` (+ docx)  
- `SALES_TERMINAL_UX_BLUEPRINT_v1.0.md` (+ docx)  
- `OPERATIONS_SALES_TERMINALS_BLUEPRINT_v1.html`  

---

# 6. Open Questions

Escalate to architect — **do not resolve in documentation curation.**

| # | Question | Conflict |
|---|----------|----------|
| OQ-1 | Which layer stack is normative when historical docs disagree? | 01: Knowledge→Runtime→Identity→Perspective→Projection→Terminal→Human vs Constitution v1 Authoring→Runtime→Projection→Experience vs Identity docs Identity→…→Runtime |
| OQ-2 | Are **Permissions** a first-class architecture layer? | Present in Addendum / Perspective Model; absent from 01 |
| OQ-3 | Who owns **C/N/I/A** naming — Projection Grammar or Terminal structure? | Projection Architecture vs 03 (same blocks, dual ownership language) |
| OQ-4 | Does Terminal lifecycle include Identity/Perspective resolution? | Root Terminal Framework vs 03 “receive Projection” |
| OQ-5 | **Manager Studio** vs **Operations** / **Studio Manager** naming | Product Model vs ARCH-002 vs Operations Terminal title |
| OQ-6 | What is **Client Studio**’s primary purpose? | Product Model (primary user type) vs ARCH-002 (“Tvorba Experience” — sounds like Builder) |
| OQ-7 | Are **Analytics / AI / Executive** Perspectives, Terminals, or Studios? | Projection/Perspective/Terminal family lists vs Product Model studio list |
| OQ-8 | Where does **Builder** authoring sit — Knowledge authoring only, or Authoring Layer? | Constitution/Arch 1.0 vs 01 Knowledge block |
| OQ-9 | Should Hero v1.0 freeze be mirrored inside `docs/platform/` or only cross-linked? | Freeze lives under `docs/architecture/` |
| OQ-10 | Binary `.docx` twins — keep, generate from md, or archive-only? | Parallel md/docx for Terminals Framework / Sales / Operations |

---

# Index of SSOT (post-curation)

| # | Document | Path |
|---|----------|------|
| 00 | Platform Constitution | [`ux-sprinty/00_PLATFORM_CONSTITUTION_v2.0.md`](./ux-sprinty/00_PLATFORM_CONSTITUTION_v2.0.md) |
| 01 | Platform Architecture | [`ux-sprinty/01_PLATFORM_ARCHITECTURE_v2.1.md`](./ux-sprinty/01_PLATFORM_ARCHITECTURE_v2.1.md) |
| 02 | Product Model | [`ux-sprinty/02_PRODUCT_MODEL_v1.0.md`](./ux-sprinty/02_PRODUCT_MODEL_v1.0.md) |
| 03 | Terminal Framework | [`ux-sprinty/03_TERMINAL_FRAMEWORK_v1.0.md`](./ux-sprinty/03_TERMINAL_FRAMEWORK_v1.0.md) |

Studio Specifications: **not processed** (per mandate).
