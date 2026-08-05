# Platform Data Constitution v1.0

**Status:** Approved — Architecture · Product · SSOT Review **PASS** · **PDM-01 Completed**  
**Ticket:** PT-PDM-01  
**Date:** 2026-08-05  
**Type:** Normative (data architecture SSOT)  

**Depends on:** [PLATFORM-DATA-AUDIT-v1.0](./PLATFORM-DATA-AUDIT-v1.0.md) · [Platform Constitution v2.0](./manager_sales_terminals/00_PLATFORM_CONSTITUTION_v2.0.md) · Product Constitution · Embed First  

**Out of scope (PDM-01):** implementation · refactor · migration · Runtime/UI changes · new features  

---

## 0. Purpose

This Constitution defines **who may create and change** platform data, and **who may only consume** it.

After approval, every Platform Data Model ticket (PDM-02+) **must** follow these rules. No Studio may invent a parallel authoring path for an object that already has an author.

### Constitutional laws (data)

1. **One author** — each object has exactly one authoring Studio (or named Runtime layer for ephemeral decision state).  
2. **One origin** — each object has one place of birth.  
3. **One edit surface** — only the author (or an explicitly delegated writer) may mutate the object.  
4. **Consumers are read-only** relative to foreign objects — they may project, never redefine.  
5. **Project is the centre** — commercial and Experience surfaces bind to a **Projekt**, not to ad-hoc parallel IDs.  
6. **Runtime does not own durable data** — Decision Session is ephemeral (aligns Product Constitution Zákon 3: Engine interprets data; does not own it).  
7. **Publish before consume** — Client / Manager / Sales / Embed interpret **published** project data only.  
8. **Mocks are not SSOT** — fixtures and demo cases must not share identity with production objects until replaced.

### Canonical product rule — nabídka (Product Review PASS)

> **Office nevlastní nabídku.** Office vlastní **obchodní proces** (odeslání nabídky, komunikaci, objednávku, platbu a stav implementace).  
> **Obsah nabídky** je vždy generován z **projektových dat a šablon** spravovaných **Builder Studio**.

This formulation is canonical for the Platform Data Constitution and for all PDM tickets.

---

## 1. Authoring Constitution

| Object | Author Studio / layer | Origin (create) | Who may edit | Who may only read |
| --- | --- | --- | --- | --- |
| **Firma** (Company) | **Builder** | Builder company registry / identity graph | Builder | Office · Manager · Sales · Client (chrome) · platform session |
| **Projekt** | **Builder** | Builder under Firma | Builder | Office · Manager · Sales · Client · Offer Experience |
| **House Package** | **Builder** | Builder mount / persist (content store) | Builder | Client · Embed · Manager (same objectId) · Sales (refs only) |
| **Hero** (visual asset) | **Builder** | House Package / project media | Builder | Client · Embed · Offer (if published) |
| **Logo** | **Builder** | Project / Firma brand assets | Builder | Office (delivery) · Manager · Sales · Client |
| **Web projektu** | **Builder** | Project metadata | Builder | Office (PDF/delivery) · Offer |
| **Nabídková šablona** | **Builder** | Builder commercial templates | Builder | Office · Offer Experience |
| **Nabídka (obsah)** | **Builder** *(generated)* | Rendered from published Projekt + šablona | Builder (via project/template edits only) | Office · partner (Offer Experience) — read / present |
| **Obchodní proces** (odeslání, komunikace, objednávka, platba, implementace) | **Office** | Office ops over published Projekt | Office | Manager · Sales (projection) |
| **Dokumenty (projektové)** | **Builder** | Project document set | Builder | Office · Client (if published) |
| **Dokumenty (obchodní / doručení)** | **Office** *(derived)* | document-runtime / deal pack from **Builder** templates + commercial process state | Office regenerate only | Partner · Finance |
| **Commercial Journey** (partner path definition) | **Builder** *(template)* · **Office** *(ops preview / case binding)* | Template in Builder; **binding** to Projekt/Firma in Office | Builder (template) · Office (case status / preview navigation only — no project content) | Client does not author CJ; partner **experiences** via Offer Experience |
| **Timeline** | **Office** | Conversation / commercial events | Office (system + operator notes) | Manager · Sales (projection) |
| **Conversation** | **Office** | Mail / Inbox / compose | Office | Manager · Sales (if projected) |
| **Workflow** (ops) | **Office** | Projection over commercial case + PE state | Office navigator (highlight) — status owned by commercial events | Manager (read) |
| **Fakturace** | **Office** | Proforma / payment events (S-007: bank statement = settlement authority) | Office / Finance process | Partner (Offer payment UX) · Manager |

### Notes on dual commercial surfaces

- **Offer Experience** presents **nabídka obsah** generated from Builder Projekt + šablona, plus payment UX. It does **not** author Firma/Projekt/HP or invent offer content.  
- **Office** owns the **obchodní proces** around that nabídka — not the nabídka content itself (canonical Product Review rule above).  
- **Office Partner Commercial Journey** is an operator **preview** of the partner path bound to the active Projekt — not a second content author and not Office Workflow.  
- **Firma** is the identity entity. Today’s Office “Partner” CRM row must eventually be a **commercial projection** of Firma (see Duplication Register), not a competing author.

### Runtime (not in authoring Studios)

| Object | Owner | Persist? |
| --- | --- | --- |
| Decision Session · Story · Outcome · Priority state | `packages/runtime` | Session only |
| AI conversation turns (Experience) | Runtime / AI delivery | Policy TBD — not Builder/Office project SSOT |

---

## 2. Studio Responsibility Matrix

### Builder Studio — sole project author

**May create / edit:** Firma · Projekt · Logo · Hero · Web · House Package · nabídkové šablony · projektové dokumenty.  

**Must not:** invent parallel commercial ledgers; own Timeline/Conversation as SSOT; redefine Runtime decision logic.

**Publish duty:** mark Projekt (+ HP + brand + templates) **published** before Office/Client may treat them as live.

### Office Studio — commercial & ops over published project

**May create / edit:** obchodní proces (odeslání nabídky, komunikace, objednávka, platba, stav implementace) · obchodní dokumenty (derived from Builder templates) · Timeline · Conversation · Workflow projection · Fakturace events · implementation handoff **references** to published Projekt.  

**Must not:** own or author **nabídka obsah**; create Firma/Projekt/HP/Hero/Logo/Web as authoring SSOT; ship seed houses as if they were Builder projects; replace Working Terminal with partner Experience content (CJ preview is isolated).

**Reads:** published Builder graph (Projekt + šablony) as the sole source of nabídka content and project truth.

### Client Studio / Embed — interpret published project

**May:** load published House Package by project `objectId` / `packageRoot`; run Decision Session; show published brand.  

**Must not:** author project content; hardcode a package that ignores the bound Projekt (closes audit D-002 as a **rule**, implementation in PDM-02+).

### Manager Studio — interpret published project + ops projections

**May:** read published Projekt/HP; project analytics from commercial + decision events.  

**Must not:** author Firma/Projekt/HP; use a different House Package than the bound Projekt (closes D-003 as a **rule**); present fixtures as production metrics without labeling.

### Sales Studio — interpret published project + lead projections

**May:** read published Projekt refs; show lead desk fed by real events when available.  

**Must not:** author project data; present fixture zájemci as production SSOT without labeling (D-008).

---

## 3. Platform Object Map

```text
Firma                          ← Builder (author)
  │
  ▼
Projekt                        ← Builder (author)  ★ centre of the platform
  ├── Logo                     ← Builder
  ├── Hero                     ← Builder
  ├── Web                      ← Builder
  ├── House Package            ← Builder (content SSOT)
  ├── Nabídková šablona        ← Builder
  ├── Dokumenty (projekt)      ← Builder
  ├── Nabídka (obsah)          ← generated from Builder Projekt + šablona
  │
  ├── Obchodní proces          ← Office (odeslání · komunikace · objednávka · platba · implementace)
  ├── Dokumenty (obchodní)     ← Office (derived from Builder templates)
  ├── Commercial Journey       ← template Builder · bind/preview Office · live Offer Experience
  ├── Timeline                 ← Office
  ├── Conversation             ← Office
  ├── Workflow (ops)           ← Office
  └── Fakturace                ← Office (+ bank authority S-007)

Runtime Decision Session       ← packages/runtime (ephemeral; under published HP)
```

### Binding rule

Every Office commercial case, Offer slug, Client/Embed session, Manager/Sales projection **must** resolve to exactly one **Projekt** id (and through it one **Firma** and one **House Package** objectId).

No third “demo case id” may act as a substitute Projekt in production paths.

---

## 4. Duplication Register

Source: [PLATFORM-DATA-AUDIT-v1.0](./PLATFORM-DATA-AUDIT-v1.0.md) §5–§6.  
Disposition for **PDM-02** (no migration in PDM-01).

| Dup ID | Audit | Current planes | Disposition | Target |
| --- | --- | --- | --- | --- |
| DUP-01 | D-001 | Builder houses vs Office provision projects vs CJ demo cases | **Přesunout** → single Projekt graph | Builder-authored Projekt list is SSOT; Office/CJ bind to it |
| DUP-02 | D-004 | Office Partner `p-dse` vs platform company vs CJ case | **Přesunout** Partner → projection of Firma | One Firma id; Office CRM becomes view |
| DUP-03 | D-002 | Client hard `/house-package` vs Projekt `packageRoot` | **Přesunout** Client load → bound objectId | Client/Embed respect publish bind |
| DUP-04 | D-003 | Manager `REFERENCE_HOUSE_PACKAGE` vs Client HP | **Odstranit** alternate package in prod path | Same objectId as Projekt |
| DUP-05 | D-005 | `PILOT_WORKSPACE_DEMO_CASES` vs Partner/Projekt | **Odstranit** from production identity | Demo-only or map 1:1 to Projekt |
| DUP-06 | D-006 | Offer catalog vs Office sales packages | **Přesunout** → one commercial ledger | Offer instance writes back to Office |
| DUP-07 | D-007 | Hero asset vs `heroLabel` string | **Zachovat** both **as types** · **Přesunout** label under Builder brand | Asset = Builder; label never invents asset |
| DUP-08 | D-008 | Sales `SALES_CLIENTS` fixtures | **Odstranit** as SSOT · **Zachovat** as labeled mock until wired | Fixtures ≠ production leads |
| DUP-09 | D-009 | Manager Work Center static funnel | **Odstranit** as SSOT · **Zachovat** as labeled mock | Metrics from events |
| DUP-10 | D-011 | Doc registry vs PDF bytes vs deal HTML | **Přesunout** | Templates Builder; instances Office derived |
| DUP-11 | D-010 | Multi `conis.*` localStorage planes | **Přesunout** (later durable store) | Single identity/content API |
| DUP-12 | D-012 | mailto vs `packages/lead` | **Přesunout** / wire or remove dead path | One lead path |
| DUP-13 | D-013 | Builder legacy `mock-data` | **Odstranit** from product paths | Keep quarantined tests only |
| DUP-14 | — | Offer Experience synthesize unknown slug | **Zachovat** temporarily for pilot · **Přesunout** to Firma/Projekt-backed offer | PDM commercial phase |

### Disposition legend

| Term | Meaning for PDM-02 |
| --- | --- |
| **Zachovat** | Keep as intentional separate type or temporary pilot aid (must be labeled) |
| **Přesunout** | Move ownership / binding to the Constitution author |
| **Odstranit** | Remove from production identity or dual package paths |

---

## 5. Implementation baseline for PDM-02

PDM-02 may start **without further architecture debate** if it executes this order:

### Phase A — Identity bind (P0)

1. Adopt **Projekt** as the only selectable work object across Builder publish → Office Select Project → Client/Embed load.  
2. Collapse Office Partner / platform company / CJ case into **Firma + Projekt** (DUP-01 · DUP-02 · DUP-05).  
3. Client/Embed load HP by Projekt `objectId` / `packageRoot` (DUP-03).  
4. Manager uses the same objectId (DUP-04).

### Phase B — Commercial ledger (P1)

5. Present a single commercial ledger for **obchodní proces** over nabídka obsah generated from Builder (DUP-06 · DUP-14) — Office does not author offer content.  
6. Commercial documents derived only from Builder templates (DUP-10).

### Phase C — Quarantine mocks (P2)

7. Label or remove Sales/Manager fixtures from appearing as live SSOT (DUP-08 · DUP-09).  
8. Remove legacy Builder mocks from product paths (DUP-13).

### Non-goals for PDM-02

- UI redesign · new commercial features · bank pairing · full backend replacement (may keep localStorage behind one API façade).

### Exit criteria for PDM-02

- One Projekt id visible in Builder, Office, Client for the same partner deal.  
- No production path depends on `PILOT_WORKSPACE_DEMO_CASES` or Manager reference package as identity.  
- Constitution §1–§3 unchanged (only implementation progresses).

---

## 6. Acceptance (PDM-01)

| Criterion | Met in this doc |
| --- | --- |
| Each object has one authoring Studio | §1 |
| Each Studio has clear responsibilities | §2 |
| Platform Object Map approved candidate | §3 |
| No ownership ambiguity for listed objects | §1 · §3 |
| PDM-02 can start without new architecture decisions | §4 · §5 |

---

## 7. Related SSOT

| Document | Role |
| --- | --- |
| [PLATFORM-DATA-AUDIT-v1.0](./PLATFORM-DATA-AUDIT-v1.0.md) | Evidence of current divergence |
| [Platform Constitution v2.0](./manager_sales_terminals/00_PLATFORM_CONSTITUTION_v2.0.md) | Platform purpose / non-goals |
| [Product Constitution](../product/constitution/product-constitution.md) | Zákon 3 — data ≠ Engine |
| Embed First (workspace rule) | Embed = production Experience; Local ≠ product reference |
| `docs/ssot/PLATFORM ROADMAP.docx` | Update after commit: mark **PDM-01 Completed** |
| `docs/ssot/PRODUCT BIBLE.docx` | Product SSOT — link, do not duplicate |

---

## 8. Review gates

| Gate | Status |
| --- | --- |
| Architecture Review | ✅ PASS |
| Product Review | ✅ PASS |
| SSOT Review | ✅ PASS |

Committed as:

```text
docs(platform): define platform data constitution v1.0
```

Next: push working branch · update PLATFORM ROADMAP · mark PDM-01 Completed · implement **PDM-02 — Shared Project Runtime**.
