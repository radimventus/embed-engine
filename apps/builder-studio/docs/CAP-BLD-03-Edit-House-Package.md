# CAP-BLD-03 — Edit House Package

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |
| **Mode** | In-memory edit (no disk write) |

## Edit flow

```text
Mount HP-002 (CAP-BLD-02)
        │
        ▼
createHousePackageEditSession(mount)
  baseline = mounted CSV / manifest / hero
  working  = same HP texts (editable)
        │
        ▼
Edit rooms.csv | gallery.csv | videos.csv | manifest | hero
        │
        ▼
validateHousePackageWorking → buildBuilderPackageRegistries
        │
        ▼
Dirty · Undo · Discard/Reset (memory only)
```

## Dirty state

`clean` → edit → `modified` → Discard/Reset → `clean`

Undo restores the previous working snapshot (local stack).

## Validation

After each mutation, object-house registries rebuild. Errors for dirty sections are surfaced in the rail and editors (`clean` / `modified` / `invalid`).

## Out of scope

Save → CAP-BLD-04 · Publish → CAP-BLD-05
