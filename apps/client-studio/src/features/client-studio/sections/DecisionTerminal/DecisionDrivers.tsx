import type { DecisionPresentation } from '../../runtime/projectDecisionPresentation';

type DecisionDriversProps = {
  readonly drivers: DecisionPresentation['drivers'];
};

/**
 * Decision Drivers — display Runtime signals only; never rank in UI (CSCB-05).
 */
export function DecisionDrivers({ drivers }: DecisionDriversProps) {
  return (
    <section aria-label="Decision Drivers" className="mt-5 space-y-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Decision Drivers
      </h4>

      <div>
        <p className="text-xs text-embed-foreground-primary/55">Vybrané priority</p>
        {drivers.priorityIds.length === 0 ? (
          <p className="mt-1 text-sm text-embed-foreground-primary/60">
            Zatím bez priorit
          </p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-2">
            {drivers.priorityIds.map((id) => (
              <li
                key={id}
                className="rounded-full bg-embed-background-primary px-2.5 py-1 text-xs font-medium text-embed-foreground-primary"
              >
                {id}
              </li>
            ))}
          </ul>
        )}
      </div>

      {(drivers.focusPriorityId !== null ||
        drivers.focusSignalKind !== null) && (
        <p className="text-sm text-embed-foreground-primary/75">
          Silný vliv:{' '}
          <span className="font-medium text-embed-foreground-primary">
            {drivers.focusPriorityId ?? drivers.focusSignalKind}
          </span>
          {drivers.focusSignalKind !== null &&
          drivers.focusPriorityId !== null ? (
            <span className="text-embed-foreground-primary/55">
              {' '}
              ({drivers.focusSignalKind})
            </span>
          ) : null}
        </p>
      )}

      {drivers.supportingArguments.length > 0 ? (
        <div>
          <p className="text-xs text-embed-foreground-primary/55">
            Podpůrné argumenty Story
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
            {drivers.supportingArguments.map((argument) => (
              <li key={argument}>{argument}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {drivers.rationale.length > 0 ? (
        <div>
          <p className="text-xs text-embed-foreground-primary/55">
            Rationale Outcome
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-embed-foreground-primary/70">
            {drivers.rationale.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
