/**
 * UX-layer progress capture for Priority conversation.
 * Records journey events only — no Decision Runtime evaluation.
 */

export type PriorityConversationPhase =
  | 'instruction'
  | 'collecting'
  | 'collection-gate'
  | 'prep'
  | 'dialog'
  | 'complete';

export type PriorityConversationEvent =
  | {
      readonly type: 'phase';
      readonly phase: PriorityConversationPhase;
      readonly at: number;
    }
  | {
      readonly type: 'priority-count';
      readonly count: number;
      readonly at: number;
    }
  | {
      readonly type: 'priority-order';
      readonly order: readonly string[];
      readonly at: number;
    }
  | {
      readonly type: 'priority-change';
      readonly added: readonly string[];
      readonly removed: readonly string[];
      readonly order: readonly string[];
      readonly at: number;
    }
  | {
      readonly type: 'selection-finished';
      readonly order: readonly string[];
      readonly at: number;
    }
  | {
      readonly type: 'add-more';
      readonly at: number;
    }
  | {
      readonly type: 'dialog-answer';
      readonly priorityId: string;
      readonly optionId: string;
      readonly at: number;
    }
  | {
      readonly type: 'dialog-continue';
      readonly priorityId: string;
      readonly at: number;
    }
  | {
      readonly type: 'intensity';
      readonly priorityId: string;
      readonly value: number;
      readonly at: number;
    }
  | {
      readonly type: 'completion-path';
      readonly path: 'faq' | 'chat' | 'audit';
      readonly at: number;
    };

export type PriorityConversationProgress = {
  readonly record: (event: PriorityConversationEvent) => void;
  readonly events: () => readonly PriorityConversationEvent[];
  readonly clear: () => void;
};

export function createPriorityConversationProgress(): PriorityConversationProgress {
  const buffer: PriorityConversationEvent[] = [];

  return {
    record(event) {
      buffer.push(event);
    },
    events() {
      return buffer.slice();
    },
    clear() {
      buffer.length = 0;
    },
  };
}

export function nextSelectionOrder(
  previousOrder: readonly string[],
  selectedIds: readonly string[],
): { order: string[]; added: string[]; removed: string[] } {
  const selected = new Set(selectedIds);
  const removed = previousOrder.filter((id) => !selected.has(id));
  const kept = previousOrder.filter((id) => selected.has(id));
  const keptSet = new Set(kept);
  const added = selectedIds.filter((id) => !keptSet.has(id));
  return {
    order: [...kept, ...added],
    added,
    removed,
  };
}
