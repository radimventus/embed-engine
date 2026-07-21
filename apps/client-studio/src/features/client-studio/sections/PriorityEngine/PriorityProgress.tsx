import { PRIORITY_ENGINE_ACTION_AREA_CLASS } from './priority-engine-layout';

type PriorityProgressProps = {
  minimumMet: boolean;
  minimumSelection: number;
  selectedCount: number;
  nextAction?: string;
};

/**
 * Presentation progress chrome — not Cognitive state.
 * “Selected” uses weight threshold; guidance copy from Interpretation.nextAction.
 */
export function PriorityProgress({
  minimumMet,
  minimumSelection,
  selectedCount,
  nextAction,
}: PriorityProgressProps) {
  return (
    <div className={PRIORITY_ENGINE_ACTION_AREA_CLASS}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
          <p className="text-sm leading-none text-embed-foreground-primary/70">
            <span className="font-medium tracking-wide">Zvýšené Priority</span>{' '}
            <span className="tabular-nums font-semibold text-embed-foreground-primary">
              {selectedCount} / {minimumSelection}
            </span>
          </p>
          {minimumMet ? (
            <p className="text-sm font-medium leading-none tracking-wide text-embed-foreground-primary">
              ✓ Připraveno pro Rozhodovací terminál
            </p>
          ) : (
            <p className="text-sm leading-none text-embed-foreground-primary/55">
              Zvyšte Priority nebo procházejte dům
            </p>
          )}
        </div>
        {nextAction ? (
          <p
            className="max-w-[680px] text-xs leading-relaxed text-embed-foreground-primary/55"
            data-testid="priority-next-action"
          >
            {nextAction}
          </p>
        ) : null}
      </div>
    </div>
  );
}
