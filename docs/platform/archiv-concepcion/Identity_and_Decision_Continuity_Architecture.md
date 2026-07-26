> **Status (kurace 2026-07-23):** HISTORICAL / ADR Candidate — Identity levels curated into 01.

# Identity & Decision Continuity Architecture

## Core Principle

The platform preserves decision continuity, not merely user
authentication.

## Identity Stack

Identity ↓ Permissions ↓ Perspective ↓ Terminal ↓ Runtime

## Identity Levels

### L0 Anonymous Visitor

Temporary Decision Session.

### L1 Recognized Device

Device identifier stored locally. Recognizes returning devices.

### L2 Persistent Decision Identity

Created when the visitor decides to preserve the journey.

Owns many Decision Sessions.

### L3 Verified Identity

Email / OAuth / Enterprise login.

Maps to the same Persistent Decision Identity.

## Identity Evidence

Evidence may include: - Device ID - Cookie token - Local storage token -
Session history - IP metadata - Browser metadata - Timezone - Language -
Verified account

Evidence contributes to confidence. It is not identity itself.

## IP Address

IP is metadata.

Never use IP as the primary identifier.

Use only as supporting evidence.

## Registration Philosophy

Registration should communicate continuity:

-   Continue your decision later.
-   Save your Decision Journey.
-   Keep your priorities and comparisons.

## Architectural Invariants

-   Runtime is the only author of meaning.
-   Identity preserves continuity.
-   Sessions are transient.
-   Decision Journey is persistent.
