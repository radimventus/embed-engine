# EPIC-BLD-01 — Foundation Report

**Status:** Ready for architecture review  
**Commit:** not created (awaiting approval)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  
**Preview:** http://127.0.0.1:4178  

---

## Verdict

Foundation skeleton is runnable: AppShell layout, Workspace, Project Registry (mock), project open/switch/create, section placeholders, Publish Panel UI from mock data. No Runtime / Build / Publish / Validation / API logic.

---

## Created components

### Layout / shell
- `AppShell` — Header + Sidebar + Workspace + Publish Panel
- `BuilderHeader`
- `BuilderSidebar` → `PartnerCard`, `ProjectList`, `NewProjectButton`
- `WorkspaceCanvas` → `ProjectHeader`, `SectionNavigation`, `MediaSection`, `LayoutSection`, `KnowledgeSection`
- `PublishPanel`
- `ErrorBoundary`

### Application layer
- `useBuilderStudioSession` — thin controller; UI talks only through handlers
- `createProjectRegistry` — List / Open / Create; Archive / Delete as prepared interface
- `createWorkspaceService` — Active Project + Assets / Runtime / Publish placeholders
- `mock-data` — in-memory seed only

### Model
- `ProjectRecord`, `WorkspaceStructure`, pipeline snapshot types, section ids

---

## AppShell structure

```
BuilderShell
 ├─ Header          (72px, CONIS Builder + partner)
 ├─ Sidebar         (260px)
 │   ├─ PartnerCard
 │   ├─ ProjectList (active highlight)
 │   └─ NewProjectButton
 ├─ Workspace       (1fr)
 │   ├─ ProjectHeader (name, Draft/Published, last sync)
 │   ├─ SectionNavigation (Média / Dispozice / Znalosti — scroll)
 │   └─ section placeholders
 └─ PublishPanel    (360px)
     ├─ Validation / Build / Publish status (mock)
     ├─ readiness % (mock, prototype affinity)
     └─ disabled Validate / Publish / Copy Embed controls
```

Grid matches approved prototype: `260px 1fr 360px`.

---

## Workspace (IMP-01)

Application-layer structure only:

- Workspace id + partner
- Projects list
- Active Project
- `assets` / `runtime` / `publish` placeholders (`{ placeholder: true }`)

No filesystem roots, no Runtime mutation, no package creation.

---

## Registry (IMP-02)

| Operation | Status |
| --- | --- |
| List Projects | implemented (mock) |
| Open Project | implemented |
| Create Project | implemented (in-memory Draft) |
| Archive Project | interface ready |
| Delete Project | interface ready |

No persistence. No API.

---

## Deviations from specification / prototype

1. **Sidebar label** — prototype uses „Domy“; Foundation uses „Projekty“ (IMP-02 / Project Registry terminology + request „Nový projekt“).
2. **Section content** — prototype shows upload galleries; Foundation uses explicit placeholders (no upload, no asset I/O).
3. **Publish actions** — buttons present for layout fidelity but **disabled**; no pipeline.
4. **Physical `/builder/...` tree** from IMP-01 — modeled as paths on records / placeholders, not created on disk.
5. **Shared Platform Registry** (doc 08) — local app service only for Foundation; not a shared package yet.
6. **No Runtime dependency** — intentional for Foundation.

---

## Screenshot

`apps/builder-studio/docs/bld-01-foundation-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| `pnpm --filter @embed-engine/builder-studio typecheck` | pass |
| `pnpm --filter @embed-engine/builder-studio test` | pass (7) |
| `pnpm --filter @embed-engine/builder-studio build` | pass |

### Tests
- `project-registry-service.test.ts` — list / open / create / archive+delete interface
- `workspace-service.test.ts` — active project, switch, create+activate, placeholders

---

## Out of scope (confirmed absent)

- Runtime logic / packages
- Build pipeline
- Publish pipeline
- Validation implementation
- Persistence / API
- Client Studio product changes

---

## Next

Await architecture review. Commit for **EPIC-BLD-01 – Foundation** only after approval.
