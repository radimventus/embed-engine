# CAP-INFRA-01 — Centralized Embed Configuration

| Field | Value |
| --- | --- |
| **ID** | CAP-INFRA-01 |
| **Status** | **Proposed** (backlog) |
| **Category** | Infrastructure / Delivery / Partner embed |
| **Priority** | **Post-pilot** (P2) — not required for first pilots |
| **Triggered by** | [ED-INFRA-001](./ED-INFRA-001.md) |
| **Related** | [Simplified snippet proposal](./embed-simplified-partner-snippet-proposal.md), PT-EMBED-MIGRATION-01 |

---

## Problem

Partner CMS snippets currently embed infrastructure details (`assetBase`, absolute distribution URLs, mount infra fields). When the public origin moved from `radimventus.github.io` to `https://conis.cz`, stale CMS paste caused CORS/`Failed to fetch` on house-package CSV — while Runtime, Builder, Delivery, and House Package were correct ([ED-INFRA-001](./ED-INFRA-001.md)).

This is a recurring failure class: any future CDN/domain change can break every partner that still carries frozen infra in HTML.

---

## Motivation

Partners must not configure infrastructure.

They should only paste a mount target and one script tag. Everything else is owned by the platform (Delivery / publish bake). Shared Runtime continues to receive a resolved `assetBase` — it does not invent infrastructure URLs.

---

## Proposed solution

1. Bake default `assetBase` / distribution origin into the published IIFE at publish time (`PAGES_ORIGIN` → `https://conis.cz`).
2. Auto-mount when a known host element is present (`#conis` / `[data-embed]`).
3. Keep optional overrides internal to Delivery — never required in partner paste.
4. Optional later: central `config.json` keyed by partner host (Delivery-owned HTTP only).

**Embed First:** configuration lives in Delivery / publish artifacts, not Local, not duplicated product UX.

**Out of scope for this CAP registration:** Runtime business-logic refactors, Builder Studio work, multi-tenant CMS product features.

---

## Target partner snippet

```html
<div id="conis"></div>
<script src="https://conis.cz/embed/embed.iife.js"></script>
```

Optional later: `data-object-id` (or equivalent) for multi-object hosts. No `assetBase`, no inline `Embed.mount({…})` infrastructure fields.

### Partner must never edit

- `assetBase`
- runtime / IIFE origin (beyond the single published script `src`)
- CDN URL
- release URL
- house-package base
- other infrastructure settings

---

## Benefits

- Zero partner CMS migration when infrastructure origin changes
- No stale-snippet class of outages (ED-INFRA-001 class)
- Uniform configuration across all partners
- CDN / domain changes without touching partner CMS

---

## Deferred to post-pilot

| Reason | Detail |
| --- | --- |
| Pilot critical path | Founding-partner pilots work with the explicit conis.cz official snippet from PT-EMBED-MIGRATION-01 |
| Risk | Auto-mount / baked defaults need careful Delivery design and publish bake — not rush mid-pilot |
| Sequencing | Close ED-INFRA-001 operationally first; implement CAP-INFRA-01 after pilot stability |

**Not** scheduled ahead of pilot-critical CAPs (e.g. CAP-P04 / CAP-P05).

Implementation order when opened: Delivery default + auto-mount before optional remote config.

---

## Acceptance (when implemented)

1. Official docs show only the minimal snippet (no `assetBase` in partner paste).
2. Omitting `assetBase` still loads `https://conis.cz/house-package/*`.
3. Changing distribution origin is a publish-only change; partner CMS HTML need not change.
4. Optional guard: Delivery warns or rewrites known-legacy github.io `assetBase` if still passed.

---

## Ownership sketch (future implementation)

| Concern | Owner | Mechanism |
| --- | --- | --- |
| Default `assetBase` | Delivery / publish bake | `EMBED_DEFAULT_ASSET_BASE = "https://conis.cz"` in IIFE |
| Auto-mount | Delivery | Discover `#conis` / `[data-embed]` on load |
| Object id | Partner attribute or central config | `data-object-id` or `GET /embed/config.json?host=` |
| Cache bust | Publish pipeline | Fingerprint / immutable naming — not partner-edited |
| Runtime business logic | Shared Runtime | Unchanged — receives resolved `assetBase` from Delivery |
