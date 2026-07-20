# ADR-001 — Runtime Architecture

**Status:** Accepted  
**Date:** 2026-07-20

---

# Context

The first implementation milestone established the infrastructure of the Embed Engine CORE.

The primary objective was to define a stable Runtime architecture before implementing the Intelligence Layer.

The Runtime must remain stable while allowing the internal implementation to evolve over time.

---

# Decision

The Runtime is the only public entry point into the CORE.

```text
createRuntime()

↓

Runtime
```

The Runtime acts as the public façade of the system.

It owns the application lifecycle but contains no business logic.

All internal orchestration is delegated to the Kernel.

---

# Runtime

Responsibilities:

* public API
* lifecycle
* Kernel ownership

The Runtime exposes:

```ts
const runtime = createRuntime();

await runtime.load(objectPackage);

await runtime.dispatch(event);

runtime.getState();

runtime.subscribe(listener);

runtime.destroy();
```

This API is considered stable.

---

# Kernel

The Kernel is the internal orchestrator.

Responsibilities:

* coordinate internal services
* delegate execution
* own infrastructure services

The Kernel is **not** part of the public API.

---

# Infrastructure Services

The initial Runtime infrastructure consists of:

```text
Kernel
    ├── EventDispatcher
    ├── StateManager
    └── ModuleRegistry
```

## EventDispatcher

Routes Runtime events.

Contains no business logic.

Does not mutate RuntimeState.

---

## StateManager

Owns RuntimeState.

Responsible for:

* state replacement
* versioning
* immutable snapshots
* listener notification

RuntimeState has a single owner.

---

## ModuleRegistry

Stores Runtime modules.

Responsibilities:

* registration
* lookup
* duplicate prevention

Contains no execution logic.

---

# Architectural Principles

The Runtime follows these principles:

* Runtime is a façade.
* Kernel is an orchestrator.
* Services have a single responsibility.
* RuntimeState has a single owner.
* Business logic does not belong to Runtime infrastructure.
* Public API remains minimal.
* Internal implementation may evolve without affecting consumers.

---

# Out of Scope

The Runtime Infrastructure does not include:

* Intelligence
* Priority
* Decision Engine
* Interpretation
* AI
* Experience
* Product-specific logic

These belong to higher architectural layers.

---

# Result

The Runtime Infrastructure is considered complete.

Future development continues with the Intelligence Layer while preserving the Runtime public API.

---

# Related

* [Runtime Decisions v1.0](../runtime-decisions.md) — historical Decision Runtime contract (CommandRuntime path)
* [ADR-006 — Interpretation & Projection Layer](./ADR-006-interpretation-projection-layer.md)
* [Post-Foundation Development Policy](../../product/post-foundation-development-policy.md)
* Implementation: `packages/core` (`createRuntime`, `Runtime`, internal Kernel services)
