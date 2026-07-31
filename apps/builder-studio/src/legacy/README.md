# Builder Studio — Legacy Quarantine (CAP-BLD-07)

**Status:** Quarantined — **not** on the production Authoring path.

Production Builder (`BuilderStudioApp`) uses only:

```text
House Package (HP-002)
  → object-house
  → Shared Runtime (via Embed.mount / Client Studio)
```

## Quarantined modules

| Module | Why kept |
| --- | --- |
| `useBuilderStudioSession.ts` | Historic EPIC-BLD lab session (mock projects, stub preview, mock publish) — unit tests / archaeology only |
| `../services/mock-data.ts` | `MOCK_PROJECTS` fixtures for legacy service tests |
| `../services/preview/*` | Stub Runtime Preview adapter — **not** Shared Runtime |
| `../services/publish/*` | In-memory mock PublishService — replaced by `pnpm embed:publish` |
| `../components/shell/*` | Lab overview UI (WorkspaceCanvas, PublishPanel, …) — unused by App |

## Rules

1. `BuilderStudioApp` must **never** import these modules.
2. Default `pnpm test` runs House Package / production-path tests only.
3. Legacy suite: `pnpm test:legacy`.
4. Do not extend Stub Runtime or mock Publish for product features.

See `docs/CAP-BLD-07-Runtime-Preview-Legacy-Retirement.md`.
