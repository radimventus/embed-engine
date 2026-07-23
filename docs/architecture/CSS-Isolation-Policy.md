# CSS Isolation Policy — Embed Delivery Layer

**Status:** Active (PT-EMBED-02A)  
**Owner:** Delivery Layer (`packages/embed`)  
**Scope:** Entire Embed Experience (Hero, CTA, Social Proof, Header, future modules)

---

## Principle

Embed must preserve its visual identity on any partner host. Experience styling must not depend on host `html`, `body`, `a`, `button`, or `*` rules.

Isolation is a **Delivery concern**, not a per-component patch.

---

## Boundary

Every public Experience surface root must carry:

```html
data-embed-boundary
```

Marked by Delivery on:

| Surface | Where |
|--------|--------|
| Embed Hero host | `mountEmbedHero` |
| Overlay root + mount | `createOverlaySurface` |
| Client Studio root | `mountClientStudio` (inline / overlay) |

---

## Forbidden assumptions

Embed styles must **not** rely on:

- host `html` / `body` typography or color
- bare `a` / `button` / `input` / `*` theme rules
- cascade order alone against late-loading host CSS
- inheritance from the partner document for critical identity

Allowed exception: `html` / `body` `overscroll-behavior` for scroll coordination (not visual identity).

---

## Critical visual properties

Public interactive / typographic surfaces must explicitly define at least:

- `color`
- `background` / `background-color`
- `font-family`, `font-size`, `font-weight`
- `line-height`, `letter-spacing`
- `text-decoration`
- `border`, `border-radius`
- `appearance`
- `cursor`
- `outline`
- `transition` (when motion is intentional)

---

## Implementation layers

1. **Boundary attribute** — inheritance root + scoping hook  
2. **Isolation stylesheet** (`#embed-css-isolation`) — reclaim `a` / `button` / form / media inside the boundary; public hooks for `[data-embed-hero-cta]` and `[data-embed-close]` with pseudo-states (`:link` / `:visited` / …) so reclaim cannot strip CTA identity  
3. **Scoped utilities** — Tailwind `important: true` + PostCSS wrap of class selectors under `[data-embed-boundary]`  
4. **Injection order** — fonts → Studio CSS → shell → isolation (isolation last)

Source: `packages/embed/src/delivery/cssIsolation.ts`, `ensureStyles.ts`, `postcss-embed-boundary-utilities.js`.

---

## Public surface hooks

| Hook | Role |
|------|------|
| `[data-embed-hero-cta]` | Primary CTA identity (navy / white / 8px radius / md padding) |
| `[data-embed-close]` | Experience Close control |
| `[data-embed-hero]` | Hero root |
| `[data-experience-header]` | Sticky header geometry |

New public controls must add a Delivery isolation hook when host tag selectors could rewrite identity.

---

## Non-goals

- Shadow DOM (future option if light-DOM isolation is insufficient)
- Changing Experience visual design
- Patching individual Client Studio sections for partner themes
