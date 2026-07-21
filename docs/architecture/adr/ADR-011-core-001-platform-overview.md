# ADR-011 — Renumber Cognitive Layer to CORE-101

**Status:** Accepted  
**Date:** 2026-07-21  
**Depends on:** [ARCH-001 Documentation Map](../ARCH-001-Documentation-Map.md), [CORE-001 Platform Architecture Overview](../platform/CORE-001-Platform-Architecture-Overview.md)

---

# Context

Two documents claimed the identifier `CORE-001`:

1. Legacy **Cognitive Layer** (`docs/architecture/core/CORE-001-cognitive-layer.md`)
2. New **Platform Architecture Overview** (`docs/architecture/platform/CORE-001-Platform-Architecture-Overview.md`)

ARCH-001 requires:

- Single Source of Truth
- Stable Document Identity
- No Parallel Truth

`CORE-001` is reserved as the root document of the Platform Architecture (CORE) series — analogous to ARCH-001 and BH-001.

`CORE-002` is already assigned to Decision State.

---

# Decision

1. **CORE-001** is exclusively **Platform Architecture Overview**.
2. Legacy Cognitive Layer is renumbered to **CORE-101**.
3. File path becomes `docs/architecture/core/CORE-101-cognitive-layer.md`.
4. All documentation references to the Cognitive Layer document must use `CORE-101`.
5. Package / code comments naming the “Cognitive Layer” concept remain valid; only the **document ID** changes.

Numbering convention for the CORE series going forward:

| Range | Role |
| --- | --- |
| **CORE-001** | Platform Architecture Overview (root) |
| **CORE-002 … CORE-099** | Core platform subsystem / aggregate specs |
| **CORE-100+** | Specialized platform layer documents (e.g. Cognitive Layer) |

---

# Consequences

- Platform Architecture has a consistent root ID (`CORE-001`).
- Cognitive Layer retains stable content under a new immutable ID (`CORE-101`).
- Historical citations of “CORE-001 Cognitive Layer” are superseded by this ADR; readers follow CORE-101.

---

# References

- [CORE-001 Platform Architecture Overview](../platform/CORE-001-Platform-Architecture-Overview.md)
- [CORE-101 Cognitive Layer](../core/CORE-101-cognitive-layer.md)
- [CORE-002 Decision State](../core/CORE-002-decision-state.md)
- [ARCH-001 Documentation Map](../ARCH-001-Documentation-Map.md)
