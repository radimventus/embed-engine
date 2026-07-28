# EPIC-BLD-07 — Validation Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Validation is an independent quality capability. It evaluates project readiness through an extensible rule engine and emits a `QualityGate` used by Publish. UI only displays results.

```
Project → Validation → Build → Publish → Runtime
```

---

## ValidationService

`createValidationService()` — public API:

| Method | Role |
| --- | --- |
| `validateProject(projectId)` | Full report |
| `validateAssets` / `validateLayouts` / `validateKnowledge` | Category scope |
| `validateBuild` / `validatePublish` | Category scope |
| `getLatestReport` / `getHistory` / `getEvents` | Session history |
| `listRules()` | Extensible catalog |

---

## Rule Engine

`ValidationRule { id, category, severity, message, recommendation, validator }`

Default categories:

- Assets
- Layout
- Knowledge
- Build
- Publish
- Runtime Preview

Rules are injectable via `createValidationService({ rules })`.

---

## ValidationReport

- score (0–100)
- passed
- qualityGate
- warnings / errors / recommendations
- timestamp
- findings

---

## Quality Gate

| Gate | Meaning | Publish |
| --- | --- | --- |
| Passed | no errors/warnings | allowed |
| PassedWithWarnings | warnings only | allowed |
| Failed | has errors | blocked |

`isPublishAllowedByQualityGate()` gates Publish in the session controller.

---

## Dashboard

`ValidationDashboard` in the right panel:

- score + Quality Gate
- errors / warnings / recommendations
- last validation time
- **Spustit validaci**
- session Validation History

---

## Events & History

- ValidationStarted
- ValidationFinished
- ValidationFailed

Session-only history (max 20). No persistence.

---

## Screenshot

`apps/builder-studio/docs/bld-07-validation-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (37) |
| build | pass |

### New tests
- full project Quality Gate flow
- category validators
- rule catalog coverage
- gate decision mapping + publish allowlist

---

## Deviations

1. Successful Build auto-runs validation in the session (keeps Quality Gate fresh); manual **Spustit validaci** remains available.
2. Publish also re-validates before distribution — Failed gate blocks Publish without calling PublishService.
3. BLD-06 ReadinessService remains as soft readiness metrics; BLD-07 Validation is the authoritative Quality Gate for Publish.
4. Info-severity findings affect score lightly but do not change Quality Gate (only errors/warnings).

---

## Out of scope (confirmed)

- Business logic in UI
- Persistence
- Runtime interpretation
- Build/Publish implementation inside Validation

---

## Next

Await architecture review. On PASS: commit **EPIC-BLD-07 – Validation & Quality Gate**.
