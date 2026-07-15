# Client Studio Measurements

Reference viewport

1600 px

Status

In progress

---

## Reference Authority

The design wireframe is the **sole authority** for layout geometry.

| Rule | Detail |
|------|--------|
| Authority | Wireframe PNG (see Provenance below) |
| Not authority | Current DOM dimensions, Tailwind tokens, or internal implementation metrics |
| DOM audits | Prove render consistency only — not design correctness |
| Deviations | If render ≠ wireframe, root cause is in React/Tailwind/layout implementation |

### Provenance

| Step | Detail |
|------|--------|
| Source tool | Google Drawings (Google Obrázek) — manually drawn |
| Design scale | 1:1 metric — horizontal and vertical proportions match intended page geometry |
| Export | PDF from Google Drawings |
| Rasterization | PDF → PNG at **1600 px width**, **uniform resize only** (aspect ratio preserved) |
| Transforms excluded | No non-uniform stretch, no separate X/Y scaling, no local section deformation |

### Reference files

| File | Role |
|------|------|
| `docs/client-studio-wireframe-1600.png` | Page 1 — primary reference for upper sections |
| `docs/client-studio-wireframe-full.png` | Full-page reference |
| `CLIENT_STUDIO_WIREFRAME_2` (assets) | Page 2 — lower sections |

Documented in CS-14 addendum B (`docs/cs-14-wireframe-provenance.json`).

---

## AppShell

| Element | Value | Status |
|----------|------:|--------|
| Top Navigation Height | 64 px | Measured |
| Sidebar Width | 48 px | Measured |

---

## Desktop Canvas

| Element | Value | Status |
|----------|------:|--------|
| Width | TBD | Measure from wireframe @ 1600 px reference |
| Left Gutter | TBD | Measure |
| Right Gutter | TBD | Measure |
| Top Margin | TBD | Measure |

---

## Header

| Element | Value | Status |
|----------|------:|--------|
| Height | TBD | Measure |
| Horizontal Padding | TBD | Measure |

---

## Hero

| Element | Value | Status |
|----------|------:|--------|
| Image Height | TBD | Measure |
| Hero Content Height | TBD | Measure |
| Social Proof Height | TBD | Measure |

---

## Default Section

| Element | Value | Status |
|----------|------:|--------|
| Internal Padding | TBD | Measure |
| Vertical Gap | TBD | Measure |

---

## Rules

Only measured values belong here.

No estimates.

No implementation decisions.