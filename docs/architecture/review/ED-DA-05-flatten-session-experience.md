# ED-DA-05 — Flatten Session Experience

**Status:** PASS  
**Date:** 2026-07-22  
**Depends on:** Decision Architecture v1.0 (FROZEN), AR-001, ED-DA-01…04

## Goal

Flatten `SessionExperience` so Runtime exposes a single canonical Experience projection (`house` + `context`) without duplicated flat fields.

---

## 1. SessionExperience Audit

### Before

`SessionExperience` mirrored Interpretation outputs both as flat top-level fields and again under `context`:

| Flat field | Duplicate under |
| --- | --- |
| `priorityIds`, `prioritySignals`, … | `context.decision.*` |
| `decisionFocus` | `context.decision.focus` |
| `decisionStory` / `Moves` / `Outcome` / `Terminal` / `aiContext` | `context.decision.story` / `moves` / `outcome` / `terminal` / `ai` |
| `activeRoomId`, `activeRoom`, `focusRoom` | `context.activeRoom.*` |
| `roomImportanceRank` | `context.navigation.roomImportanceRank` |

### After (canonical)

```ts
type SessionExperience = {
  readonly house: ExperienceHouse;   // Object / presentation projection
  readonly context: ExperienceContext; // Experience projection (navigation + decision)
};
```

| Category | Owner |
| --- | --- |
| Runtime state | `DecisionSession` (unchanged; serialize/replay) |
| Experience projection | `context` |
| Object projection | `house` |
| Presentation projection | Client Studio `SynchronizedExperience.context` media slices |

---

## 2. Flattening Summary

- Removed all flat semantic duplicates from `SessionExperience`.
- Client Studio `projectSynchronizedExperience` now **reads** Runtime `context` (no re-`projectExperienceContext` from flat fields).
- `SynchronizedExperience` flattened to `{ house, context }` (enriched active room lives at `context.activeRoom.room`).
- Consumers updated to `experience.context.*`.

---

## 3. Remaining Compatibility Layers

None retained for SessionExperience flat fields.

`SessionInterpretation` still carries pipeline-shaped fields (Story, Moves, …) as the interpret→project intermediate — that is Runtime internal composition output, not a duplicate Experience contract.

---

## 4. Acceptance Checklist

- [x] Single canonical SessionExperience structure
- [x] Redundant nesting removed
- [x] Field ownership clear
- [x] Client Studio consumes simplified structure
- [x] Runtime behaviour / pipeline / Terminal / AIContext unchanged
- [x] Serialization/replay unaffected (session-level, not Experience)
- [x] Tests pass

---

## Remaining Engineering Debt

| ID | Status |
| --- | --- |
| ED-DA-05 | **Done** |
| ED-DA-06 | **Done** — [ED-DA-06 report](./ED-DA-06-injectable-clock.md) |
| ED-DA-02 residual | Object-owned media catalog |
| RAR | Runtime Architecture Review (certify hardening) |
| Legacy cognitive modules | Delete when dialogue Terminal retired |
