import {
  DECISION_TERMINAL_CHROME_CS,
  formatDecisionKeyCs,
  formatPriorityIdCs,
} from '../../pilot/decisionTerminalLabels';
import type { DecisionPresentation } from '../../runtime/projectDecisionPresentation';

type DecisionDriversProps = {
  readonly drivers: DecisionPresentation['drivers'];
};

/**
 * Decision Drivers — display Runtime signals only; never rank in UI (CSCB-05 / 05A).
 */
export function DecisionDrivers({ drivers }: DecisionDriversProps) {
  const supporting = drivers.supportingArguments.slice(0, 5);

  return (
    <section aria-label={DECISION_TERMINAL_CHROME_CS.drivers} className="mt-5 space-y-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        {DECISION_TERMINAL_CHROME_CS.drivers}
      </h4>

      <div>
        <p className="text-xs text-embed-foreground-primary/55">
          {DECISION_TERMINAL_CHROME_CS.selectedPriorities}
        </p>
        {drivers.priorityIds.length === 0 ? (
          <p className="mt-1 text-sm text-embed-foreground-primary/60">
            {DECISION_TERMINAL_CHROME_CS.noPriorities}
          </p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-2">
            {drivers.priorityIds.map((id) => (
              <li
                key={id}
                className="rounded-full bg-embed-background-primary px-2.5 py-1 text-xs font-medium text-embed-foreground-primary"
              >
                {formatPriorityIdCs(id)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {(drivers.focusPriorityId !== null ||
        drivers.focusSignalKind !== null) && (
        <p className="text-sm text-embed-foreground-primary/75">
          {DECISION_TERMINAL_CHROME_CS.strongInfluence}:{' '}
          <span className="font-medium text-embed-foreground-primary">
            {drivers.focusPriorityId !== null
              ? formatPriorityIdCs(drivers.focusPriorityId)
              : formatDecisionKeyCs(drivers.focusSignalKind!)}
          </span>
          {drivers.focusSignalKind !== null &&
          drivers.focusPriorityId !== null ? (
            <span className="text-embed-foreground-primary/55">
              {' '}
              ({formatDecisionKeyCs(drivers.focusSignalKind)})
            </span>
          ) : null}
        </p>
      )}

      {supporting.length > 0 ? (
        <div>
          <p className="text-xs text-embed-foreground-primary/55">
            {DECISION_TERMINAL_CHROME_CS.supportingArguments}
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
            {supporting.map((argument) => (
              <li key={argument}>{formatDecisionKeyCs(argument)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
