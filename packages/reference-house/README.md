# @embed-engine/reference-house

Canonical on-disk **Reference House Package** (CAP-HP-002.1).

Conforms to [HP-001](../../docs/03-specification-standard/HP-001-House-Package-Specification.md).
Platform role: [PT-001](../../docs/architecture/pt/PT-001-house-package-canonical-object-contract.md).

```text
house.json          # HP-001 manifest
assets/             # referenced media / documents / floorplans
```

Load via `@embed-engine/object-house/loader` — Runtime never reads this tree directly.
