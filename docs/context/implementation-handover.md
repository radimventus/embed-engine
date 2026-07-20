# Embed Engine -- Implementation Handover

## Mission

Implement the CORE. Documentation must never become the bottleneck.

## Current Status

-   Architecture is stable enough for implementation.
-   Missing architectural ideas are archived as short records only.
-   Reference Architecture/Bible is postponed until after
    implementation.
-   Development proceeds in small, reviewable commits.

## Working Mode

-   Agent: implementation, refactoring, repetitive changes.
-   ChatGPT: architecture review, API contracts, code review, design
    decisions.
-   If implementation uncovers an architectural gap:
    1.  Decide (max 10 minutes)
    2.  Archive (1 page)
    3.  Continue coding

## Immediate Goal

Milestone 1 -- Runtime Skeleton

Target public API:

``` ts
const runtime = createRuntime();

await runtime.load(objectPackage);
await runtime.dispatch(event);

runtime.getState();
runtime.subscribe(listener);
runtime.destroy();
```

## First Commit

feat(core): bootstrap runtime skeleton

## Rules

-   Small commits only.
-   No scope creep.
-   Runtime first.
-   Features later.
-   Archive knowledge, then continue implementation.
