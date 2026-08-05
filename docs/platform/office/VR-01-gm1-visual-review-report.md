# VR-01 — GM-1 Final Visual Review Report

**Status:** PASS  
**Date:** 2026-08-04  
**Scope:** CONIS platform as one product after GM-1 (not single-screen QA)  
**Commit policy:** No commit — validation report + visual backlog for GM-2 only  
**Follow-on concept:** UX-01 — GM-1 Workflow Review (ergonomics · clicks · mental model)

---

## Visual Readiness Score

| Dimension | Score (0–100) | Notes |
| --- | --- | --- |
| Commercial Experience (Offer) | 82 | Strong brand hierarchy; intentional sharp commercial grammar |
| Office Studio ergonomics | 68 | Functional but dense; token drift in pilot chrome |
| Multi-studio design language | 78 | Shell-aligned studios; Client Studio correctly Embed-first |
| Platform tokens / states | 74 | SSOT exists; Office literals weaken it |
| Terminology consistency | 80 | CONIS / Workflow / Tasks mostly aligned |

### **Overall Visual Readiness Score: 76 / 100**

**PASS rationale:** The platform reads as **one CONIS product** with an intentional split between partner-facing Offer (commercial) and operator Studios (ops shell). No Critical issues that break brand identity, illegibility, or product coherence. Major/Minor items and Quick Wins feed GM-2 polish (not GM-1 blockers).

---

## 1. Commercial Experience

Surfaces: Hero · Offer · Checkout · Payment · Documents · Success  
SSOT: `apps/offer-experience/src/index.css` (`--offer-*` tokens)

| Criterion | Assessment |
| --- | --- |
| Visual hierarchy | **Strong** — logo + partner + hero greeting; navy primary CTAs; gold accents for brand cues |
| Trust | **Strong** — cream canvas, restrained watermark, clear package cards |
| Commercial communication | **Good** — package grid + summary panel; stepper keeps path visible |
| Information density | **Appropriate** — commercial breathing room (not ops-dense) |

**Findings:** Offer deliberately avoids PlatformShell (architecture rule). Radius `4px` and navy CTAs differ from studio blue/`18px` cards — **intentional commercial grammar**, not accidental drift. Untokenized slate `#94a3b8` on inactive stepper steps is Minor.

---

## 2. Office Studio

Surfaces: Nav · Select Project · Working Terminal · Workflow · Conversation · Timeline · Office Tasks · Document Viewer  
SSOT: PlatformShell + `apps/office-studio/src/index.css`

| Criterion | Assessment |
| --- | --- |
| Working ergonomics | **Adequate** — Terminal + Workflow usable; nested cards increase fatigue |
| Orientation | **Mixed** — dual project selectors (sidebar + work-surface bar) compete |
| Visual consistency | **Weakest GM-1 surface** — slate fills, green mismatch, Tasks reuse Docs CSS |

**Findings (Major):** Office Tasks visually aliased to Documents; workflow done-green ≠ `--platform-green`; slate `#f8fafc` / `#f1f5f9` vs cream material; radius mix 8/10/12 vs platform card 18.

---

## 3. Other Studios

| Studio | Shell | Consistency |
| --- | --- | --- |
| Sales Studio | PlatformShell | Closest to click-model; minor denser card overrides |
| Manager Studio | PlatformShell | Cream/ink aligned; local canvas shells noted historically |
| Builder Studio | PlatformShell | Tailwind mirrors platform; `muted` incorrectly = navy |
| Client Studio | Embed tokens (no shell) | Correct Embed-first Experience — not ops chrome |

Shared studio accent `#18428f` and cream/navy/gold identity hold. Client Studio must not be forced into PlatformShell.

---

## 4. Platform Consistency

| Area | Status |
| --- | --- |
| Design tokens | Platform SSOT in `packages/platform-shell` — navy / gold / cream / blue / green / red |
| Typography | Inter across Offer + shell; scale mostly coherent |
| Spacing | Shell rhythm solid; Office nests more borders than shell defaults |
| Color | Core identity shared; Office slate + wrong green are the main leaks |
| Iconography | Platform icon utilities present; Office timeline uses navy chips |
| States | Badges tokenized; Workflow done marker off-token |
| Terminology | Workflow / Tasks / Documents / Timeline — clear; “Documents” vs Tasks aliasing hurts |

---

## 5. Issue register

### Critical

*None.*  
(Offer vs Studio interaction grammar is intentional product framing, not a Critical defect.)

### Major

| ID | Area | Issue |
| --- | --- | --- |
| V-M01 | Office | Status green `#2f6b4f` ≠ `--platform-green` `#137a43` on Workflow done markers |
| V-M02 | Office | Slate material (`#f8fafc`, `#f1f5f9`, …) vs CONIS cream SSOT |
| V-M03 | Office | Office Tasks reuse `.office-pilot-docs*` — Tasks look like Documents |
| V-M04 | Office | Dual Select Project controls (sidebar + terminal project bar) |
| V-M05 | Office | Radius/type drift vs PlatformCard (8–12px vs 18px cards) |
| V-M06 | Builder | Tailwind `muted` mapped to navy (`#001930`) — muted ≡ ink |

### Minor

| ID | Area | Issue |
| --- | --- | --- |
| V-N01 | Offer | Untokenized inactive stepper `#94a3b8`, hover navy `#072449` |
| V-N02 | Sales | PlatformCard title/padding denser than shell default |
| V-N03 | Office | Sidebar brand weaker than Offer hero logo treatment |
| V-N04 | Office | Gold active border on docs as literal vs `var(--platform-gold)` |
| V-N05 | Office | Nested terminal borders → visual noise on Inbox/Composer |

---

## 6. Quick Wins (GM-2 visual backlog)

CSS/copy-only; map into CAP-GM2-04 / polish wave:

| ID | Win | Where |
| --- | --- | --- |
| V-QW01 | `#2f6b4f` → `var(--platform-green)` | `apps/office-studio/src/index.css` |
| V-QW02 | Slate fills → `var(--platform-cream-light)` / canvas | Office composer, docs, lists |
| V-QW03 | Line literals → `var(--platform-line)` | Office sidebar + pilot chrome |
| V-QW04 | Docs active border → `var(--platform-gold)` | `.office-pilot-docs__item--active` |
| V-QW05 | Introduce `.office-pilot-tasks*` (stop aliasing Docs) | `ProjectOfficeTasks.tsx` + CSS |
| V-QW06 | Tokenize Offer muted/error | `apps/offer-experience/src/index.css` |
| V-QW07 | Builder `muted` → `#64748b` | `apps/builder-studio/tailwind.config.js` |
| V-QW08 | Prefer single project selector in Working Terminal chrome | Office IA (coordinate with UX-01) |

Suggested GM-2 backlog ids (planning only): **GM2-VIS-01…08** under Document & Operator Clarity / polish — do not expand GM-1.

---

## 7. Recommendations before GM-2

1. Land Quick Wins V-QW01–07 early in CAP-GM2-04 (or a thin visual polish CAP) — low risk, high coherence.  
2. Treat Offer sharpness + navy CTAs as **protected commercial identity**; do not force PlatformShell onto Offer.  
3. Run **UX-01 Workflow Review** next: click count, hesitation points, dual project selector mental model (V-M04 / V-QW08).  
4. Keep Client Studio on Embed tokens — visual “difference” is architectural correctness.  
5. Use Visual Readiness Score **76** as baseline; target **≥ 85** after Quick Wins for multi-partner scale.

---

## 8. Acceptance checklist (VR-01)

| Criterion | Result |
| --- | --- |
| Platform reads as one product | **PASS** (intentional Offer/Studio split) |
| No Critical visual issues | **PASS** (0 Critical) |
| Quick Wins list for GM-2 | **PASS** (V-QW01–08) |
| Visual Review Report delivered | **PASS** (this document) |

## Verdict

**PASS**

No commit. Visual backlog = §6 Quick Wins → GM-2.
