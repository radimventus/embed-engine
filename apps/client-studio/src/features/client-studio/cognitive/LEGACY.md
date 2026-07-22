# LEGACY — Cognitive Providers (ED-DA-04)

Not mounted on the live Client Studio Decision Session path.

Decision Session Experience uses `DecisionSessionRuntimeProvider` only.

## Remaining files

| Module | Purpose if remounted |
| --- | --- |
| `ExperienceBindingProvider` | Cognitive Runtime session subscription |
| `InterpretationProvider` | Cognitive Interpretation selector |
| `DecisionStoryProvider` | Cognitive Decision Story selector |
| `useDecisionTerminal` / `TerminalShell` | Unmounted dialogue Terminal |

## Rule

Do not reintroduce these Providers into `ClientStudioPage` without an explicit Architecture Review — they are not Context transport for Decision Session semantics.

Canonical Story / Outcome / Terminal / AI: `experience.context.decision.*`.
