import type { InterpretationPriority } from '@embed-engine/core/cognitive';

import { DECISION_CATEGORIES } from './decision-cards.constants';

type PriorityReasonsProps = {
  priorities: readonly InterpretationPriority[];
};

function titleFor(id: string): string {
  return DECISION_CATEGORIES.find((category) => category.id === id)?.title ?? id;
}

export function PriorityReasons({ priorities }: PriorityReasonsProps) {
  return (
    <aside
      aria-label="Priority reasons"
      className="rounded-[8px] border border-embed-border-default bg-white/70 p-3"
      data-testid="priority-reasons"
    >
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/55">
        Why priorities moved
      </p>
      {priorities.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-embed-foreground-primary/45">
          Interact with the property to see why priorities change.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {priorities.map((priority) => (
            <li
              key={priority.id}
              className="text-xs leading-snug text-embed-foreground-primary/80 transition-[opacity,transform] duration-300"
              data-testid={`reason-${priority.id}`}
            >
              <span className="font-semibold text-embed-brand-gold">
                {titleFor(priority.id)} ↑ {Math.round(priority.weight * 100)}
              </span>
              {priority.reason ? (
                <span className="mt-0.5 block text-embed-foreground-primary/65">
                  {priority.reason}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
