# Embed Engine -- Architecture Archive Strategy (Working Agreement)

## Purpose

This document is **not** the Reference Architecture and **not** the
Architecture Bible.

Its sole purpose is to preserve architectural knowledge before it is
lost from conversation context, allowing implementation to continue
without documentation becoming a bottleneck.

## Core Principle

Archive first. Implement second. Consolidate later.

The objective is to capture architectural decisions, patterns,
invariants and mental models as quickly as possible.

## Working Rules

1.  Every new architectural idea is evaluated with one question:

    "Will we lose this knowledge if it is not written down now?"

2.  If YES:

    -   create a short archive record (1--2 pages maximum)
    -   freeze the decision
    -   continue implementation

3.  If NO:

    -   continue implementation immediately.

## Archive Record Template

Status: - Draft - Candidate - Frozen

Problem

Decision

Rationale

Consequences

Open Questions

Related Components

## What belongs in the archive

-   architectural patterns
-   runtime contracts
-   invariants
-   ownership rules
-   decision models
-   state ownership
-   event models
-   plugin model
-   lifecycle rules
-   Priority Engine concepts
-   Decision Session concepts
-   Object Package concepts

## What does NOT belong

-   React implementation
-   TypeScript implementation
-   file names
-   framework details
-   UI polishing
-   code snippets

Those belong to implementation.

## End Goal

After implementation reaches a stable state, all archive records can be
merged into a single Reference Architecture without rediscovering
forgotten ideas.

Until then, the archive exists only to preserve knowledge and unblock
development.
