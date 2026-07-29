# EPIC-BX-01 — Project Workspace Report

## Scope

Implemented the first product-facing Builder Studio screen: `Projects`.

Workspace is the organizational entry layer where a user can:

- create a new project
- open an existing project
- duplicate a project
- archive a project
- inspect project status
- search and sort projects
- continue unfinished work quickly

This layer does not edit object content, does not publish, does not mutate Runtime, does not use AI, and does not contain export business logic.

## Delivered Components

| Component | Status |
|---|---|
| WorkspaceService | PASS |
| Project model | PASS |
| WorkspacePackage | PASS |
| WorkspaceStrategy | PASS |
| BasicWorkspaceStrategy | PASS |
| WorkspaceValidator | PASS |
| WorkspaceIndex | PASS |
| Projects UI | PASS |
| Events | PASS |
| API | PASS |

## Project model

- `id`
- `name`
- `slug`
- `description`
- `status` (`DRAFT` | `READY` | `PUBLISHED` | `ARCHIVED`)
- `thumbnail`
- `createdAt`
- `updatedAt`
- `lastOpenedAt`
- `metadata`

## Service / API

- `initialize()`
- `createProject()`
- `openProject()`
- `duplicateProject()`
- `archiveProject()`
- `listProjects({ query?, sortBy? })`
- `findProject()`
- `dispose()`

## Events

- `ProjectCreated`
- `ProjectOpened`
- `ProjectDuplicated`
- `ProjectArchived`
- `ProjectStatusChanged`

## UI

Main screen: `Projects`

Each card shows:

- name
- thumbnail
- status
- last change
- last opened

Actions:

- Open
- Duplicate
- Archive

Header:

- `+ New Project`

Also included:

- search by name
- sort by last change / name / status

## Validation Notes

- project creation is deterministic via registry slug generation
- duplicate creates a new project id and clones asset content
- archive does not delete project data
- list/find API stays stable for large project sets (index + filter/sort)

## Verification

```text
npx tsc --noEmit
PASS

npx tsx --test src/services/workspace-service.test.ts
PASS

npx vite build
PASS

npm test
PASS
```

## Screenshot

![Project Workspace](bx-01-project-workspace-screenshot.png)
