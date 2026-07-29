# ED-INFRA-001 — Remove GitHub Pages as Production Origin

| Field | Value |
| --- | --- |
| **ID** | ED-INFRA-001 |
| **Status** | **PASS** |
| **Category** | Infrastructure / Deployment / Embed Runtime |
| **Priority** | P1 (resolved) |
| **Date** | 2026-07-29 |
| **Tickets** | PT-DIAG-EMBED-01, PT-EMBED-MIGRATION-01 |
| **Follow-up CAP** | [CAP-INFRA-01 — Centralized Embed Configuration](./CAP-INFRA-01-centralized-embed-configuration.md) |

---

## Symptom

Partner host (`https://www.domysenergii.cz/embed`) failed Builder House Package bootstrap:

```text
Builder House Package bootstrap failed: Failed to fetch
```

Network showed CSV loads against:

```text
https://radimventus.github.io/embed-engine/house-package/gallery.csv
```

instead of:

```text
https://conis.cz/house-package/gallery.csv
```

---

## Root Cause

Historical partner snippets used:

```text
assetBase = https://radimventus.github.io/embed-engine
```

After custom-domain migration to `https://conis.cz`, GitHub Pages returned **301** to the new domain. Browser `fetch()` then failed on the CORS redirect (`Failed to fetch`).

**Not** a defect in:

- Runtime
- Builder
- Delivery Layer
- House Package

**Actual cause:** historical partner snippet pasted into the partner CMS (BaseKit), with `assetBase` still pointing at the legacy github.io origin. That value was originally emitted by `sync-pages.mjs` when `PAGES_ORIGIN` was the project Pages URL.

---

## Resolution

### Repo

| Artifact | Change |
| --- | --- |
| `packages/embed/scripts/sync-pages.mjs` | `PAGES_ORIGIN = "https://conis.cz"` |
| `packages/embed/scripts/publish-release.mjs` | same |
| `packages/embed/scripts/validate-pages.mjs` | same |
| `docs/embed/*` | official snippet / live / partner harness on conis.cz only |

Canonical production origin: **`https://conis.cz`**.

### Production

Partner must update the CMS snippet so:

```text
assetBase = https://conis.cz
```

Runtime requires no code change once `assetBase` is correct.

Operational checklist: [embed-migration-checklist.md](./embed-migration-checklist.md)  
Release note: [Embed-Infrastructure-Migration.md](../releases/Embed-Infrastructure-Migration.md)

---

## Validation

**Repo status:** **PASS**

| Check | Result |
| --- | --- |
| Repo production load URLs use only `https://conis.cz` | Done |
| Official partner snippet uses `conis.cz` only | Done |
| Partner CMS updated (operator action) | Outside repo — required for live partner PASS |
| Runtime loads `https://conis.cz/house-package/*` | After CMS cutover |
| Zero requests to `radimventus.github.io` | After CMS cutover |
| All CSV return HTTP 200 + CORS OK on conis.cz | Verified for direct conis.cz origin |

This ED is **closed (PASS)** for repository / platform infrastructure. Live partner hosts remain an operator checklist item until CMS paste.

---

## Lessons Learned

Partner-facing snippets must never contain infrastructure-specific
configuration that may change over time.

Infrastructure ownership belongs to the Runtime, not to partner CMS
integrations.

Partner integrations should remain infrastructure-agnostic whenever
possible.

Operational nuance for this codebase: defaults are owned by **Delivery / publish** (`PAGES_ORIGIN`, baked `assetBase`); Shared Runtime only consumes the resolved base. Partners must not own either.

---

## Preventive action

Register **CAP-INFRA-01** (post-pilot) so partners never configure infrastructure (`assetBase`, CDN, release URLs).

Formal CAP: [CAP-INFRA-01 — Centralized Embed Configuration](./CAP-INFRA-01-centralized-embed-configuration.md)
