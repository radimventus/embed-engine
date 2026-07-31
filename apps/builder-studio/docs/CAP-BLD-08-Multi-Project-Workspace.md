# CAP-BLD-08 — Multi-Project Workspace

| Field | Value |
| --- | --- |
| **Status** | Done |
| **ADR** | [ADR-023](../../../docs/architecture/adr/ADR-023-house-package-content-ssot.md) |

## Workspace

```text
Workspace (metadata only)
  ├── Family 98  → apps/client-studio/public/house-packages/family-98
  ├── Harmony 124 → apps/client-studio/public/house-packages/harmony-124
  └── Villa 168  → apps/client-studio/public/house-package
```

Workspace stores **Open / Close / Recent / Last Opened** only.  
Content stays inside each HP-002 root.

## Mount switching

```text
Select project
  → Dirty? → Save | Discard | Cancel
  → POST /api/workspace/active  (single active root)
  → Unmount current HP
  → Mount selected HP at /house-package
  → Reload Builder session
```

No parallel mounts. Vite serves `/house-package/*` from the active disk root.

## Dirty protection

| Action | Modified working copy |
| --- | --- |
| Switch project | Save / Discard / Cancel |
| Close project | Save / Discard / Cancel |

## Out of scope

- Company / Login
- Publish / Runtime changes
- Manager / Sales
