# PT-PRIORITY-DIALOGUE-01 — Od formuláře ke koučovacímu dialogu

Date: 2026-07-26

## Verdict

**Local PASS** — Priority Experience presentation transformed into a user-paced coaching dialogue. Runtime / Decision Engine / Decision Flow / data model unchanged.

---

## Checklist → implementation map

| Review item | Implementation | Notes |
|-------------|----------------|-------|
| 1 CONIS as coach | Coaching copy in `priorityConversation.constants.ts` — „Zkusme společně…“, „Pomozte mi lépe porozumět…“ | No „Vyberte…“ / „Potřebuji informace“ |
| 2 Intent before question | `PRIORITY_QUESTION_INTENT` + `priority-conversation-question-intent` | Done |
| 3 Interpretation after answer | `PRIORITY_ANSWER_INTERPRETATION` + interpretation beat | Soft hypothesis, not verdict |
| 4 User-paced tempo | Answer → interpretation → **Pokračovat** (`continueDialog`) | Auto quiz advance removed |
| 5 Priority summary / hypothesis | `buildPriorityHypothesisSummary` — priorities, first picture, thanks | Not results |
| 6 PDF promise | Expanded PDF note after summary | Value promise, no selling |
| 7 Soft progress | Minimal `{n} %` cue | No progress bar |
| 8 Audit as service | Dedicated audit block — why / what / why now | Plot validation & continued work |
| 9 AI Chat seeded | `coachChatOpeningFromPriorities` + `advisorOpeningForExperience` | Summary + discussion prompt |
| 10 FAQ from priorities | `coachFaqItemsFromPriorities` — natural Conis questions | Presentation layer only |
| 11 Thanks when earned | Thanks only in complete summary after answers | Removed from prep |

### Not deferred

All checklist items implemented. No intentional skips.

---

## Validation

| Check | Status |
|-------|--------|
| Conis as coach | PASS |
| Intent before questions | PASS |
| Interpretation after answers | PASS |
| User-paced Continue | PASS |
| Audit as service | PASS |
| Chat seeded from Priority | PASS |
| FAQ natural from priorities | PASS |
| No Runtime / Flow / model change | PASS |
| Unit tests | PASS |

Assets: `docs/reviews/assets/pt-priority-dialogue-01/`

---

## Files

- PriorityEngine: coaching dialogue module, constants, hook, panel, progress events, tests
- AIAdvisor: experience presentation FAQ/chat opening, AIAdvisor seed, MessageBubble newlines, ownership tests
- `docs/reviews/PT-PRIORITY-DIALOGUE-01.md`
