/**
 * PT-010 — Last-write-wins MemoryResolutionStrategy (v1).
 *
 * - Within a bucket: latest `at` for a key is active.
 * - Across accepted/rejected options: latest `at` for a key wins (one active side).
 * - History is never mutated.
 */

import type {
  DecisionMemory,
  MemoryItem,
} from "../../prompt/models/DecisionMemory";
import type {
  ResolvedMemory,
  ResolvedMemoryItem,
} from "../models/ResolvedMemory";
import type { MemoryResolutionStrategy } from "./MemoryResolutionStrategy";

export class LastWriteWinsResolutionStrategy
  implements MemoryResolutionStrategy
{
  resolve(history: DecisionMemory): ResolvedMemory {
    const options = resolveOptionBuckets(
      history.acceptedOptions,
      history.rejectedOptions,
    );

    return Object.freeze({
      facts: Object.freeze(resolveScalarBucket(history.facts)),
      preferences: Object.freeze(resolveScalarBucket(history.preferences)),
      constraints: Object.freeze(resolveScalarBucket(history.constraints)),
      goals: Object.freeze(resolveScalarBucket(history.goals)),
      concerns: Object.freeze(resolveScalarBucket(history.concerns)),
      acceptedOptions: Object.freeze(options.accepted),
      rejectedOptions: Object.freeze(options.rejected),
    });
  }
}

function resolveScalarBucket(
  items: readonly MemoryItem[],
): ResolvedMemoryItem[] {
  const winners = new Map<string, MemoryItem>();
  for (const item of items) {
    const previous = winners.get(item.key);
    if (previous === undefined || item.at >= previous.at) {
      winners.set(item.key, item);
    }
  }

  return [...winners.values()]
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map((item) => Object.freeze({ key: item.key, value: item.value }));
}

function resolveOptionBuckets(
  accepted: readonly MemoryItem[],
  rejected: readonly MemoryItem[],
): {
  readonly accepted: ResolvedMemoryItem[];
  readonly rejected: ResolvedMemoryItem[];
} {
  type Side = "accepted" | "rejected";
  type Event = MemoryItem & { readonly side: Side };

  const events: Event[] = [
    ...accepted.map((item) => ({ ...item, side: "accepted" as const })),
    ...rejected.map((item) => ({ ...item, side: "rejected" as const })),
  ].sort((a, b) => a.at - b.at || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  const winners = new Map<string, Event>();
  for (const event of events) {
    winners.set(event.key, event);
  }

  const acceptedOut: ResolvedMemoryItem[] = [];
  const rejectedOut: ResolvedMemoryItem[] = [];

  for (const event of [...winners.values()].sort((a, b) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0,
  )) {
    const item = Object.freeze({ key: event.key, value: event.value });
    if (event.side === "accepted") {
      acceptedOut.push(item);
    } else {
      rejectedOut.push(item);
    }
  }

  return { accepted: acceptedOut, rejected: rejectedOut };
}
