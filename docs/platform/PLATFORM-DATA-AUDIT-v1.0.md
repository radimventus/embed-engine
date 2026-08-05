# PLATFORM-DATA-AUDIT-v1.0 — Forenzní audit datové vrstvy

**Status:** Ready for Product Review · **Commit:** hold until PASS  
**Ticket:** PT-AUDIT-01  
**Date:** 2026-08-05  
**Scope:** Analytic only — no implementation changes  

**Studios audited:** Builder · Office · Client · Manager · Sales  
**Also mapped:** Offer Experience · Shared Runtime · platform-access · object-house  

---

## 0. Verdict (one page)

| Question | Answer |
| --- | --- |
| Do all Studios share one data layer? | **No.** Multiple parallel planes. |
| Why Builder ≠ Office objects? | Different domain models + different seeds (AC Modular houses vs Domy s energií / CJ demo cases). |
| Production data today? | House Package files on disk · browser `localStorage` MVP stores · optional live SMTP. **No multi-tenant backend.** |
| Seed data? | platform-access defaults · OF-11 Office reference partner · Builder workspace defaults · Offer catalog. |
| Mock / fixture data? | Office CJ demo cases · Manager Work Center · Sales desk clients · Client contact/FAQ seeds · timeline mocks. |
| Runtime data? | Decision Session in Client (full) · Manager (narrow, reference house) · CJ step projection · document-runtime artifacts. |
| Single SSOT for Partner / Project / HP / Hero / Doc / Offer / CJ? | **Partial at best.** See §5. |

**Bottom line:** Visual Review was correct — Studios do not read one shared object list. Continue implementation only with explicit awareness of which plane each surface uses. Gaps become separate PTs (see §6).

---

## 1. Současný stav — přehled Studií

### 1.1 Builder Studio

| Field | Value |
| --- | --- |
| Role | Author House Packages (Experience content) |
| Main objects | Company · Project folder · House (HP mount) · HP content (rooms/media/hero/plans) |
| Reads | platform-access company defaults · Builder workspace seed · disk HP via Vite `/house-package/` · `object-house` parse |
| Writes | `localStorage` `conis.builder.*` (metadata) · disk via `/api/house-package/persist` |
| Lifecycle | Seed on empty storage · durable per browser origin · HP durable on developer disk |
| Shared Runtime? | **No** (package.json may declare; UI path uses object-house mount) |

**Default identity plane:** `ac-modular` · houses `family-98` / `harmony-124` / `villa-168` (+ Opava/Brno clones).

### 1.2 Office Studio

| Field | Value |
| --- | --- |
| Role | Salesperson workspace · partner prep · Commercial Journey **preview** |
| Main objects | Partner · Sales case · Document package · Handoff · Events · CJ demo case · Timeline · Inbox |
| Reads | Office registries (`conis.office.*`) · `PILOT_WORKSPACE_DEMO_CASES` · platform-access provision/branding · document-runtime · business-automation |
| Writes | `conis.office.*` localStorage · platform `conis.platform.*` on prepare/deliver · SMTP relay (env) |
| Lifecycle | Partner/Sales/Docs durable per browser · CJ demo cases **in-memory only** |
| Shared Runtime? | **No** Decision Session. Workflow = ops projection over case status. |

**Default identity plane:** Partner `p-dse` (Domy s energií) · platform project `project-domy-s-energi-01` · label **Reference House**.  
**CJ plane (separate):** `case-dse-starter` / Nord / Ateliér — not Partner Registry.

### 1.3 Client Studio (Local / Embed host)

| Field | Value |
| --- | --- |
| Role | Partner-facing Experience (canonical product surface for Runtime) |
| Main objects | House object · rooms · media · Decision priorities/story/outcome · brand chrome |
| Reads | `/house-package/*.csv` (+ media) → Runtime · optional platform session for branding |
| Writes | Session-local Runtime state · lead = mailto mock (not `packages/lead`) |
| Lifecycle | Bootstrap once per session · HP from checked-in public package |
| Shared Runtime? | **Yes** — full Decision Session |

**Does not** dynamically switch HP from Office `packageRoot` metadata.

### 1.4 Manager Studio

| Field | Value |
| --- | --- |
| Role | Partner operations / analytics chrome |
| Main objects | Work Center funnel (static) · Ops overview from Runtime · platform metrics · brand |
| Reads | `REFERENCE_HOUSE_PACKAGE` (object-house) for Runtime probe · Work Center HTML fixtures · platform-access registries · product-learning localStorage |
| Writes | Learning feedback localStorage · session |
| Lifecycle | Session Runtime on reference house · analytics mostly mock |
| Shared Runtime? | **Partial** — not Client’s live package |

### 1.5 Sales Studio

| Field | Value |
| --- | --- |
| Role | Sales desk UX |
| Main objects | Zájemci · house interest chips · journey/insight copy |
| Reads | `salesClients.ts` fixtures · platform-access brand/project crumbs |
| Writes | Session only |
| Lifecycle | Compile-time fixtures |
| Shared Runtime? | **No** |

### 1.6 Offer Experience (partner purchase path — not a Studio, but production commercial surface)

| Field | Value |
| --- | --- |
| Main objects | PublicOffer · packages · checkout · payment |
| Reads | Seed offers by slug (`domy-s-energi`, …) · **synthesize** for unknown partner slugs (PT-COM-02) |
| Writes | Checkout/payment Runtime state in-app (no shared Office sales registry write-back) |
| Class | Seed catalog + synthesized partner offer · Runtime payment UX |

---

## 2. Datové zdroje (klasifikace)

### Legend

| Class | Meaning |
| --- | --- |
| **Production Data** | Durable content or live adapters used as if real (disk HP, localStorage MVP, live SMTP) |
| **Seed Data** | Canonical defaults shipped in repo to bootstrap demos/pilots |
| **Mock / Fixture Data** | Hardcoded UI presentation; not a system of record |
| **Runtime Data** | Derived in-session from Runtime / projections / document generation |

### Inventory

| Data set | Class | Owner path |
| --- | --- | --- |
| House Package files (`apps/client-studio/public/house-package`, `house-packages/*`) | Production | Disk · Builder persist |
| Builder workspace metadata `conis.builder.workspace.v2` | Production (local MVP) | Builder |
| Office partners/sales/docs/events/handoffs `conis.office.*.v1` | Production (local MVP) | Office |
| Platform session/users/companyExtras/branding/invites `conis.platform.*` | Seed + Production (local) | platform-access |
| `DEFAULT_PROJECTS` / `DEMO_USERS` / `ac-modular` houses | Seed | `packages/platform-access/.../defaults.ts` |
| OF-11 `p-dse` / Reference House IDs | Seed | `officeReferencePartner.ts` |
| Builder `DEFAULT_WORKSPACE_*` | Seed | `workspaceRegistry.ts` |
| Offer `OFFER_PACKAGES` / seed slugs | Seed | `offer-experience` |
| `PILOT_WORKSPACE_DEMO_CASES` | Mock | `pilotWorkspaceModel.ts` |
| Pilot timeline `MOCK_EVENTS` | Mock | `pilotTimelineStore.ts` |
| Manager Work Center numbers | Mock | Manager UI |
| Sales `SALES_CLIENTS` | Fixture | `salesClients.ts` |
| Client `experienceContact` / FAQ seeds | Mock | Client Studio |
| Builder `services/mock-data.ts` | Mock (legacy/quarantined) | Not used by live Builder UI |
| Decision Session state | Runtime | `packages/runtime` |
| CJ step projection | Runtime | `commercialJourneyModel.ts` |
| document-runtime PDF artifacts | Runtime | Office delivery |
| `REFERENCE_HOUSE_PACKAGE` | Seed fixture (in-code) | `packages/object-house` |
| Live SMTP send | Production (env-gated) | Office Vite relay |

---

## 3. Datové toky (skutečný stav)

Intended narrative:

```text
Builder → Storage → Runtime → Office → Manager → Sales → Client
```

**Actual:**

```text
                    ┌── disk HP files ──┐
                    │                   ▼
 Builder Studio ────┤ persist      Client Studio ──► packages/runtime (Decision Session)
                    │                   ▲
                    │            hard-fetch /house-package
                    │            (ignores Office packageRoot)
                    │
 platform-access registries (localStorage)
        │
        ├──► Builder seed merge (defaults; extras partial)
        ├──► Office prepare/deliver (writes branding, companyExtras, invites)
        ├──► Manager / Sales chrome (brand · project label)
        └──► Client brand projection only (optional session)

 Office Partner Registry (conis.office.*) ──► salesperson CRM UI
 Office CJ demo cases (memory) ───────────► Partner Commercial Journey preview
 Offer Experience (seed/synthesize) ──────► partner purchase (separate app)
 Manager REFERENCE_HOUSE_PACKAGE ─────────► ops Runtime probe (≠ Client HP)
 Sales fixtures ──────────────────────────► desk UI only
```

### Per link: write / read / owner

| Link | Writes | Reads | Owner today |
| --- | --- | --- | --- |
| Builder → disk HP | Builder persist API | Client fetch · Builder remount | Disk files (content SSOT) |
| Builder → platform projects | Mostly reads defaults | Builder workspace UI | platform-access defaults ≠ Builder folder IDs fully unified |
| Office → platform provision | `preparePilotForPartner` | Manager/Sales/Client brand | platform-access stores |
| Office → Partner registry | Office UI | Office only | `conis.office.partners.v1` |
| Office → CJ preview | React extras only | CJ route | Demo cases (no durable owner) |
| Office → Offer | Email link + slug | Offer Experience | Offer app seed/synthesize; **no write-back** to Office sales |
| Client → Runtime | Session mutations | Client Experience | Runtime instance (ephemeral) |
| Manager → Runtime | — | Ops projection | Reference package owner = object-house fixture |
| Sales → Runtime | — | — | N/A |

---

## 4. Životní cyklus dat (shrnutí)

| Plane | Create | Persist | Cross-device | Destroy |
| --- | --- | --- | --- | --- |
| HP disk | Builder author | Filesystem | Via git / deploy | Manual |
| Browser registries | Seed hydrate / UI CRUD | localStorage | **No** (except `?pilot=` snapshot hydrate) | Clear storage |
| CJ demo cases | Compile-time | Memory | No | Reload |
| Decision Session | Client/Manager boot | Memory | No | Reload |
| Offer checkout | Partner browser | Memory | No | Reload |
| SMTP message | Office send | External mailbox | Yes | Mail provider |

---

## 5. SSOT Audit (named objects)

| Object | Where created | Who owns | Who reads | Single SSOT? |
| --- | --- | --- | --- | --- |
| **Partner** | Office Partner Registry (seed `p-dse`) · platform company on provision | Office registry **or** platform company — **two** | Office · (brand via platform) | **No** — CRM partner ≠ platform company ≠ CJ case |
| **Projekt** | Builder folders/houses · platform `DEFAULT_PROJECTS` · Office provision `project-domy-s-energi-01` · CJ case labels | Multiple | Each studio its own list | **No** |
| **House Package** | Disk under client-studio public · Builder mounts | Disk content + `object-house` parse | Client · Builder · (Manager uses **different** reference package) | **Partial** — content SSOT = disk + object-house; **not** one active package across Studios |
| **Hero** | HP `media/hero/*` (content) · Office/platform `heroLabel` (string) | Two meanings | Builder/Client vs Office PDF/brand | **No** — content Hero ≠ branding label |
| **Dokument** | document-runtime generate · Office document registry · deal HTML under `docs/platform/office/deal/` | Split | Office Documents / delivery PDF | **No** — registry metadata ≠ generated bytes ≠ deal SSOT HTML |
| **Nabídka** | Offer Experience seed/synthesize · Office sales packages · PDF offer artifact | Offer app vs Office sales | Partner Offer Experience · Office sales UI | **No** — catalogs parallel; PDF is delivery artifact |
| **Commercial Journey** | `commercialJourneyModel` steps · Office preview over demo/`activeCase` · real partner path = Offer Experience | Preview owner = Office UI · production purchase = Offer Experience | Office CJ route · partner Offer app | **No single store** — intentional dual surface (see S-008); must not be confused with Office Workflow |

### Why Builder and Office show different objects

1. Builder lists **AC Modular** house packages (`villa-168`, …).  
2. Office Partners seeds **Domy s energií** (`p-dse`) and provisions **Reference House**.  
3. Partner Commercial Journey Select Project lists **demo commercial cases**, not Builder houses and not 1:1 Partner Registry rows.  
4. Handoff seed IDs (`project-domy-s-energi-01`) ≠ Builder workspace folder IDs (`project-ac-modular-pilot`, …).  
5. Same human-readable name (“Reference House” / “Modern 01”) can appear with **different IDs and package roots**.

This is an architectural inconsistency for Visual Review — not a single-bug UI glitch.

---

## 6. Rizika (D-xxx)

| ID | Severity | Risk | Evidence |
| --- | --- | --- | --- |
| D-001 | **P0** | No unified Project/Object list across Builder ↔ Office ↔ Client | Different seeds and registries |
| D-002 | **P0** | Client ignores Office `packageRoot` — provisioned partner may not get “their” HP in Client | Client hard-fetches `/house-package` |
| D-003 | **P1** | Manager Runtime ≠ Client Runtime package (`REFERENCE_HOUSE_PACKAGE` vs Builder CSV) | Same display id `house-modern-01`, different roots |
| D-004 | **P1** | Partner triplicated: Office CRM · platform company · CJ demo case | `p-dse` vs `company-domy-s-energi` vs `case-dse-starter` |
| D-005 | **P1** | Commercial Journey preview not durable / not Partner Registry | `PILOT_WORKSPACE_DEMO_CASES` memory-only |
| D-006 | **P1** | Offer Experience does not write back to Office Sales / Documents | Separate apps |
| D-007 | **P2** | Hero dual meaning (asset vs label) — S-005 related | Branding labels vs HP media |
| D-008 | **P2** | Sales Studio fixtures look like live leads — false ops signal | `SALES_CLIENTS` |
| D-009 | **P2** | Manager Work Center mock metrics look like live analytics | Static click-model |
| D-010 | **P2** | localStorage “production” is single-browser MVP — not multi-device SSOT | All `conis.*` keys |
| D-011 | **P2** | Document planes split (registry · generated PDF · deal HTML) | Office docs + document-runtime + deal/ |
| D-012 | **P3** | `packages/lead` unused; Client mailto | Dead capability risk |
| D-013 | **P3** | Legacy Builder `mock-data` still in tree | Quarantined but confusing |

**Seed/mock on “production” paths**

- First external pilot still depends on seeds (OF-11, platform defaults) plus localStorage + SMTP.  
- CJ preview seed cases must not be mistaken for live partner pipeline.  
- Offer synthesize is intentional for first sale (PT-COM-02) — still not a durable Offer SSOT.

---

## 7. Doporučená cílová architektura (bez implementace)

### 7.1 Principles

1. **One identity graph** for Tenant → Company → Workspace → Project → Object (HP ref).  
2. **One content SSOT** for House Package bytes (authored in Builder, addressed by `packageRoot` / object id).  
3. **Runtime is ephemeral** — never the system of record for Partner/Project.  
4. **Office CRM** projects from identity graph + commercial events — does not invent parallel partner IDs for the same firm.  
5. **Mocks stay labeled** — Sales/Manager fixtures cannot share identity IDs with production objects until wired.  
6. **Embed First** — Client/Embed Experience is the only product Runtime consumer that must bind to the provisioned object.

### 7.2 Target ownership

```text
Identity SSOT     → platform-access (evolve toward durable backend)
Content SSOT      → House Package store (disk → later object storage) + object-house contract
Decision SSOT     → packages/runtime (session only)
Commercial SSOT   → Offer + Order + Payment events (single commercial ledger)
Delivery artifacts→ document-runtime (derived)
Analytics         → projections from commercial + decision events (not fixtures)
```

### 7.3 Target flow

```text
Builder authors HP
        ↓
Content Store (packageRoot / objectId)
        ↓
Provision binds Company/Project → objectId
        ↓
Client / Embed loads THAT package → Runtime
        ↓
Decision / commercial events → Office / Manager / Sales projections
```

### 7.4 Suggested follow-up PTs (not in this ticket)

| Suggested PT | Addresses |
| --- | --- |
| PT-DATA-01 | Unify Project/Object identity (D-001 · D-004) |
| PT-DATA-02 | Client loads provisioned `packageRoot` / objectId (D-002) |
| PT-DATA-03 | Manager Runtime binds to same object as Client (D-003) |
| PT-DATA-04 | Bind CJ preview Select Project to Partner Registry (D-005) |
| PT-DATA-05 | Offer → Office commercial write-back (D-006) |
| PT-DATA-06 | Label/quarantine Sales & Manager fixtures (D-008 · D-009) |

---

## 8. Acceptance checklist (audit questions)

| # | Question | Answer location |
| --- | --- | --- |
| 1 | Odkud každé Studio čte data? | §1 |
| 2 | Kam zapisuje? | §1 · §3 |
| 3 | Co jsou produkční data? | §2 |
| 4 | Co jsou seed data? | §2 |
| 5 | Co jsou mock data? | §2 |
| 6 | Které objekty mají jediný SSOT? | §5 — none fully; HP content closest |
| 7 | Kde jsou duplicity / porušení? | §5 · §6 |

---

## 9. Regression Guard

This audit **did not modify** application code. Output = this document only.

---

## 10. Related

- [Platform Data Constitution v1.0](./PLATFORM-DATA-CONSTITUTION-v1.0.md) — normative ownership (PDM-01)  
- [PDM-02 implementation baseline](./PDM-02-implementation-baseline.md)  
- [ADR-019 Runtime vs Release](../architecture/adr/ADR-019-runtime-vs-release.md)  
- [PT-VR-01 restore Office workspace](./office/PT-VR-01-restore-office-workspace.md)  
- [PT-COM-02 sales enablement](./office/PT-COM-02-pilot-sales-enablement.md)  
- [Improvement Log S-001…S-008](./office/improvement-log/README.md)  

After Product Review **PASS**, commit:

```text
docs(audit): complete platform data forensic audit
```

Then push working branch.
