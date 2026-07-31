# CAP-BLD-04 — House Package Persistence

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |

## Persist flow

```text
Working copy (dirty HP texts)
        │
        ▼
POST /api/house-package/persist  (Vite Node host)
        │
        ▼
persistBuilderHousePackage (@embed-engine/object-house/builder-package/node)
  · stage → backup → atomic rename
  · on failure: restore backups (no partial commit)
        │
        ▼
Remount HP-002 → validate → Clean
```

## Files written (changed only)

| File | When |
| --- | --- |
| `rooms.csv` | rooms dirty |
| `gallery.csv` | gallery dirty |
| `videos.csv` | videos dirty |
| `manifest.json` | manifest and/or hero dirty |

Hero metadata is stored as `heroRelativePath` inside existing `manifest.json` (no new package format).

## Atomicity

1. Write all payloads to `.hp-persist-staging-*`
2. Snapshot current targets to `.hp-persist-backup-*`
3. `rename` staged → final (same filesystem)
4. On error: restore from backup / remove new files; delete staging+backup
5. Success returns `written: []` empty on failure — nothing confirmed

## Dirty state

`modified` → Save OK → remount → `clean`  
`modified` → Save fail → `save-failed` (working copy kept) → edit again → `modified`
