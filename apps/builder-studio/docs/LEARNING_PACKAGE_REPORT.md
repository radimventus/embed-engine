# EPIC-BLD-23 — Learning Package Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of next EPIC (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Learning Package Manager spravuje verzované balíčky referencí na Learning Records. Ukládá reference (ne kopie), verzuje, indexuje a validuje — neanalyzuje, nevytváří Patterny/heuristiky a nepoužívá AI.

```
Analytics Snapshot
        │
        ▼
Learning Record
        │
        ▼
Learning Package
        │
        ▼
Learning Package Manager
```

Uzavírá infrastrukturu Knowledge Feedback Layer (spolu s Learning Pipeline).

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `65627ab` | Decision Analytics Engine (už dříve) |
| `7194232` | `feat(builder): implement learning pipeline foundation` (skutečný předchozí necommitnutý EPIC) |

Poznámka: prompt žádal Analytics commit — ten už existoval. Commitnut byl Learning Pipeline (BLD-22) dle Commit Strategy.

---

## LearningPackageManager

| Method | Role |
| --- | --- |
| `createPackage()` | Create Draft package |
| `loadPackage()` / `savePackage()` | Read / write |
| `addRecord()` / `removeRecord()` | Manage references |
| `publishPackage()` | Validate + Published |
| `dispose()` | Disposed status |

---

## Models

- **LearningRecordsPackage** — id, name, version, timestamps, records[], versions[], metadata  
  *(TypeScript name avoids clash with BLD-15 `LearningPackage`)*  
- **LearningRecordReference** — id, recordId, source, timestamp, metadata  
- **LearningPackageVersion** — version, createdAt, author, changes, metadata  

---

## LearningIndex / LearningPackageValidator

**LearningIndex** — index / find / list / rebuild  

**LearningPackageValidator** — validate / validateRecords / validateVersion  

---

## Learning Package Overview

Sekce Builderu `learning-package-mgr` (nav **Package**):

- Package / Records / Versions / Index / Validation  
- Create / Add Record Ref / Remove / Validate / Publish / Dispose  
- `data-testid="learning-package-overview"`  

Odděleno od:
- **Learning** (BLD-15 observations/patterns/heuristics)
- **Pipeline** (BLD-22 Learning Pipeline)

---

## Events

| Event | When |
| --- | --- |
| `LearningPackageCreated` | create |
| `LearningRecordAdded` | addRecord |
| `LearningRecordRemoved` | removeRecord |
| `LearningPackageValidated` | validate / publish |
| `LearningPackagePublished` | publish success |

---

## API

`createLearningPackageManagerApi(manager)`:

- `createLearningPackage()`
- `loadLearningPackage()`
- `publishLearningPackage()`
- `listLearningRecords()`
- `validateLearningPackage()`

---

## Screenshot

`apps/builder-studio/docs/bld-23-learning-package-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (100) |
| build | pass |

### New tests
- LearningIndex index/find/list
- LearningPackageValidator empty name
- create → add → remove → publish + events
- API create/load/publish/list/validate

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| LearningPackage type name | `LearningRecordsPackage` | Avoid clash with BLD-15 LearningPackage |
| Nav label | **Package** | Fits crowded nav; Overview title remains Learning Package |
| Package model | + `versions[]`, `validation` | Version history + Overview |

**Not implemented (by design):** Pattern Engine, Heuristic Engine, AI, ML, Scoring, Recommendation, Personalization.

---

Čeká na architektonickou kontrolu. Commit za tento EPIC vznikne na začátku dalšího EPIC při PASS.
