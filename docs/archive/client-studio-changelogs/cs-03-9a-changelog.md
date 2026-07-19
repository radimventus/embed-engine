# CS-03.9A Changelog — Spatial Terminal Regression Fix

## Summary

Restores production geometry regressions from CS-03.9. No behavior, architecture, or state machine changes.

## MediaModeToggle Position

- Restored `grid-rows-[auto_1fr_auto]` on Room Index — VIDEO/FOTKY sits below navigation, not adjacent to Main Media
- Nested Property Explorer grid: media + room columns share height (`items-stretch`); Decision Canvas column is independent
- Toggle bottom aligns with Thumbnail Rail bottom (0 px delta verified)

## Floor Selector Geometry

- Segmented control width fixed to `9.5rem` (152 px) — matches VIDEO/FOTKY
- Removed `w-full` stretch; floor selector centered via `SEGMENTED_CONTROL_CENTER_CLASS`
- Height remains 38 px

## Unchanged

- House Package, Walkthrough Engine, state machine, Transition Language, column proportions (50% / 15% / 35%)
