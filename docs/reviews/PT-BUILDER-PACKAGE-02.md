# PT-BUILDER-PACKAGE-02 — Finalize HP-002 as Locked SSOT

| Field | Value |
| --- | --- |
| **ID** | PT-BUILDER-PACKAGE-02 |
| **Date** | 2026-07-24 |
| **Status** | Done |
| **Depends on** | PT-BUILDER-PACKAGE-01 |
| **Scope** | Documentation / architecture rules only |

## Summary

HP-002 is **finalized and locked** as the long-term SSOT for the Builder House Package (authoring Object Package).  
No data-model, importer API, or CSV column-schema changes in this PT.

## Spec

- [HP-002 Builder House Package Input Format](../03-specification-standard/HP-002-Builder-House-Package-Input.md) — **Status: Final — Locked SSOT** (v1.1)

## What was added

| Topic | Locked rule |
| --- | --- |
| Repo layout | Package root `apps/client-studio/public/house-package/`; media root `…/media/` |
| Metadata ban | Runtime MUST NOT derive metadata from filenames or directories; SSOT = `gallery.csv`, `rooms.csv`, `videos.csv` |
| Hero | Not gallery; standalone Experience; MAY be photo or video later |
| Providers | `provider` is an open enum (`wistia`, `youtube`, `vimeo`, `mux`, `local`, …) |
| Registries | Internal import artifacts only; never hand-edited; not part of the Builder package |
| Terminology | Builder House Package = authoring Object Package → deterministic registries + Runtime Manifest |

## Explicit non-changes

- Importer API unchanged
- CSV column schemas unchanged
- No Runtime code changes in this PT

## Validation

| Check | Result |
| --- | --- |
| HP-002 documents physical structure in the repository | Pass |
| Architectural principles are explicit | Pass |
| Builder House Package format treated as final / locked SSOT | Pass |

## SSOT confirmation

**HP-002 is locked as the Single Source of Truth for Builder House Package authoring input.**  
Subsequent Runtime or Builder work MUST conform to HP-002 or revise the specification explicitly.
