# @embed-engine/object-house

House Object Package for the EMBED Engine.

## Principle

> Object Package is the source of truth. Experience is its interpretation.

This package holds structured knowledge about a house. It contains no React, no Runtime, and no rendering.

Renderers must never import this package. They consume `ExperienceModel.house` only.
