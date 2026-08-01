# VR-FIX-05 — Click Model Completion Report

**Status:** PASS — Pilot readiness  
**Commit target:** `refactor(platform): finalize click model compliance for pilot readiness (VR-FIX-05)`  
**SSOT:** `docs/platform/click model.html`, `docs/platform/Builder/`, `docs/platform/manager_sales_terminals/`

VR-FIX-01…04 closed shell, visual system, interaction grammar, and cross-studio journey. VR-FIX-05 is the final compliance audit and last-mile polish before Pilot Review.

---

## 1. Click Model Compliance Audit

### Aligned with HTML SSOT

| Surface | Match |
| --- | --- |
| Platform Shell header | 70px navy, CON**I**S gold, role switcher pills |
| Rails | Sidebar ~260px, Inspector / Publish ~340px |
| Cards / badges | 18px radius, shared tone vocabulary |
| Studio pad | 28×32 |
| Builder Anchor Rail | Média · Dispozice · Znalosti (+ product modules) |
| Builder Publish rail | Připravenost projektu · Zkontrolovat stav · Publikovat změny · Náhled |
| Manager title-bar | Studio name + Firma/Projekt + „Živá data z Runtime“ |
| Landing visual tokens | Inter + navy `#001930` + blue `#18428F` |
| Cross-studio continuity | Session cookie keeps Company / Workspace / Project |

### Deviations found → fixed in VR-FIX-05

| ID | Deviation | Fix |
| --- | --- | --- |
| B1 | Anchor / breadcrumb EN `Media` / `Rooms` / `Knowledge` | Czech click-model labels |
| B2 | Publish rail `Akce` / EN CTAs | `Připravenost projektu` + Czech CTAs |
| B3 | Readiness row `Knowledge` | `Znalosti` |
| B4 | Builder ink/muted drift from platform | `#001930` / `#64748B` |
| M1 | Missing Manager title-bar | Click-model title-bar + badge |
| M2 | Sidebar group EN `Platform` / `Customers` / `Operations` | `Platforma` / `Zákazníci` / `Provoz` |
| A1 | Sales header without title-bar rhythm | Shared title-bar + health badge |
| L1 | Landing IBM Plex / `#1e4d8c` | Inter + platform blues |
| S1 | No responsive collapse | Hide inspector ≤1100px; tighten header/sidebar ≤900/720 |

### Consciously kept (not HTML-restored)

| Keep | Rationale |
| --- | --- |
| Manager capability modules (Launch / Ops / Commercial / Learning / CS) | Product IA beyond funnel HTML prototype |
| Operations Terminal surfaces vs HTML funnel cards | Spec’d terminal; HTML is illustrative |
| Sales as Customer Success projection (not 3-col sales desk) | Architecture: Sales = projection |
| Studio switcher short labels (`Manager`…) | VR-FIX-04 density; full names in `title` |
| Breadcrumb · Project Switcher · Feedback · Notifications | Multi-studio chrome absent from single-page HTML |
| Extra Builder modules (Experience, Preview, Release, …) | Product modules; HTML tabs are a subset |
| Project-first Workspace (`Projekt` + ⊕) vs HTML `Partner`/`Domy` | Intentional Workspace evolution |
| Capability Inspector co-mounted with Publish | Capability Host SSOT |
| `Builder concept.html` white 72px header | Superseded by integrated navy 70px model |

---

## 2. Terminology (canonical)

| Concept | UI label | Notes |
| --- | --- | --- |
| Company | Firma | Domain: Company |
| Workspace | Workspace | Domain entity; not left-nav chrome |
| Project | Projekt | Header Project Switcher |
| Studio | Manager / Sales / Builder | Short chrome labels |
| Preview | Náhled / Preview | Builder CTA: Náhled; module: Preview |
| Publish | Publikovat změny | Primary Builder CTA |
| Release | Release | Module + version history |
| Launch | Launch | Capability / module name (EN product term) |

---

## 3. Responsive Audit

| Breakpoint | Behavior |
| --- | --- |
| ≤1100px | Inspector rail hidden |
| ≤900px | Tighter header, studio pad, sidebar 220px |
| ≤720px | Feedback trigger hidden; Manager sidebar hidden; dialog pad reduced |
| `prefers-reduced-motion` | Transitions/animations off (VR-FIX-03) |

Desktop remains the pilot primary; tablet/mobile degrade gracefully without new layouts.

---

## 4. Pilot Journey Validation

```text
Login → Platform Landing → select Project → Builder
  → edit (Média / Dispozice / Znalosti) → Náhled → Publikovat změny
  → Otevřít Manager → Sales → Platform Landing (CONIS / clearStudio)
```

Context (Company · Workspace · Project) preserved via Platform Access session cookie across ports. No new workflow; navigation uses existing `selectStudio` / `selectProject` / `clearStudio`.

---

## 5. Out of scope (unchanged)

- Runtime  
- HP-002  
- Capability Registry  
- Intelligence  
- Platform Access domain / auth  
- Publish pipeline  

---

## 6. Sign-off

| Criterion | Result |
| --- | --- |
| Implementation matches HTML click models where SSOT applies | PASS |
| Landing · Builder · Manager · Sales feel like one product | PASS |
| Pilot Journey without UX blockers | PASS |
| VR-01 can close | PASS |

**VR-FIX-05 complete. VR-01 ready to close pending Pilot Review.**
