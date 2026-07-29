
# ARCH-002 — Hranice produktů
## SSOT v1.0

## Cíl

Jednoznačně definovat odpovědnosti jednotlivých studií platformy Embed Engine a zabránit překryvu jejich funkcí.

---

## Architektura platformy

### Client Studio
**Účel:** Tvorba rozhodovací Experience.

Odpovědnosti:
- návrh Experience,
- Decision Layer,
- Runtime Preview,
- publikace Experience.

---

### Studio Manager
**Účel:** Řízení každodenního provozu.

Odpovědnosti:
- Operations,
- práce s případy,
- denní briefing,
- situace vyžadující pozornost,
- dnešní posun,
- slabá místa,
- stav týmu.

---

### Builder Studio
**Účel:** Tvorba, validace a optimalizace Experience.

Odpovědnosti:
- validace Experience,
- připravenost Experience,
- AI doporučená vylepšení,
- konfigurace modulů,
- správa assetů,
- quality assurance,
- publikace Experience.

---

## Matice odpovědností

| Funkce | Studio Manager | Builder Studio |
|--------|:--------------:|:--------------:|
| Denní práce s případy | ✅ | ❌ |
| Fronty | ✅ | ❌ |
| Stav týmu | ✅ | ❌ |
| Slabá místa | ✅ | ❌ |
| Validace Experience | ❌ | ✅ |
| Připravenost Experience | ❌ | ✅ |
| Doporučená vylepšení | ❌ | ✅ |
| Konfigurace modulů | ❌ | ✅ |
| Správa assetů | ❌ | ✅ |
| Publikace Experience | ❌ | ✅ |

---

## Migrační plán

| Současný dokument | Cílové umístění |
|-------------------|-----------------|
| MS-12 | EB-01 |
| MS-13 | EB-02 |

Do doby architektonické revize zůstávají dokumenty vedeny pod řadou MS z důvodu kontinuity návrhu.

---

## Architektonické principy

- Jedna odpovědnost pro každé studio.
- Žádné duplicitní funkce.
- Studio Manager řídí provoz.
- Builder Studio zlepšuje Experience.
- Client Studio Experience vytváří.

---

## Akceptační kritéria

- Jasně definované hranice všech studií.
- Každá funkce má jednoho vlastníka.
- Migrační plán je součástí dokumentace.
