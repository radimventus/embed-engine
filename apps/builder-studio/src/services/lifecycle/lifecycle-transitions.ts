/**
 * Allowed lifecycle transitions (EPIC-BLD-06).
 * UI must not mutate status directly — only LifecycleService.
 */

import type { LifecycleStatus } from '../../model';

const TRANSITIONS: Readonly<
  Record<LifecycleStatus, readonly LifecycleStatus[]>
> = {
  Draft: ['ReadyForBuild', 'Archived'],
  ReadyForBuild: ['Draft', 'Built', 'Archived'],
  Built: ['ReadyForBuild', 'ReadyForPublish', 'Archived'],
  ReadyForPublish: ['Built', 'Published', 'Archived'],
  Published: ['Archived', 'ReadyForPublish', 'Built'],
  Archived: ['Draft'],
};

export function canTransition(
  from: LifecycleStatus,
  to: LifecycleStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: LifecycleStatus,
  to: LifecycleStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid lifecycle transition: ${from} → ${to}`);
  }
}
