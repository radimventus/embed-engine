# Experience Integration Pack 1 — Synchronization Report

| Field | Value |
| --- | --- |
| **Artifact** | Experience Integration Pack 1 |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): synchronize runtime experience` |
| **Type** | Product Integration (presentation only) |

---

## Implementation summary

Synchronized Client Studio Gen1 Experience with Runtime intelligence already present in Context — no Runtime API changes, no redesign, no new capabilities.

| Area | Change |
| --- | --- |
| Hero | Bound existing Focus fields (`primaryReason`, `focusRoomName`, `recommendedAction`) with Czech labels |
| Spatial | Idle media = Object Package exterior; floor plan = Object Package PNG; no auto-`SelectRoom`; Focus preferred still on room media |
| Priority → Terminal | Continuity copy; recommendation peer **enabled**; Czech Recommendation + Decision Report |
| Decision language | `formatDecisionKeyCs` / `formatOutcomeStatusCs` on Report, Recommendation, AI FAQ/intro, Report Preview |
| AI Advisor | Readable FAQ + intro from same label map as Terminal |

---

## Synchronized surface checklist

| Surface | Synced | Evidence |
| --- | --- | --- |
| Hero | **Yes** | `data-testid="hero-runtime-focus"` — Fokus + Další krok |
| Property Explorer | Unchanged (already Object facts) | — |
| Spatial | **Yes** | Idle `/media/house-modern-01/exterior.webp`; floorplan Object Package |
| Priority | **Yes** | Continuity cue + Recommendation panel |
| Decision Terminal | **Yes** | Czech labels (CSCB-05A path included) |
| AI Advisor | **Yes** | No raw `explain:` keys in FAQ |
| Commercial Conversion | Unchanged (already mapped strip) | — |

---

## Screenshots (after)

| Surface | Asset |
| --- | --- |
| Hero | [eip1-hero-after.png](./assets/eip1-hero-after.png) |
| Spatial idle | [eip1-spatial-after.png](./assets/eip1-spatial-after.png) |
| Priority + Terminal | [eip1-priority-terminal-after.png](./assets/eip1-priority-terminal-after.png) |
| AI Advisor | [eip1-ai-after.png](./assets/eip1-ai-after.png) |

Before state is documented in [Experience Synchronization Audit](../../reviews/Experience-Synchronization-Audit.md) (raw AI keys, no Hero Focus, Spatial auto-room catalog stills).

---

## How the visible Decision Journey differs (first-time user)

**Before:** Same Embed shell, but Priority felt like a static picker; Spatial opened on a catalog room photo; AI showed machine keys; Hero was only a listing.

**After:** Same Embed shell and layout. Opening Hero already speaks Focus (“Fokus: Obývací pokoj · … / Další krok: …”). Spatial starts on the Object Package exterior until you pick a room. Choosing priorities updates the Decision Terminal beside the cards **and** a recommendation panel below — it clearly reacts. AI FAQ reads in Czech. The journey feels like the same product that now adapts to what you choose.

---

## Validation

| Check | Result |
| --- | --- |
| typecheck | **PASS** |
| tests | **PASS** — 52/52 |
| Runtime changes | None |
| Visual redesign | None |

---

## Architectural invariants

- [x] Presentation only
- [x] No new Experience Surfaces
- [x] No Runtime / API changes
- [x] No duplicated Runtime state
- [x] Embed visual language preserved
