import type {
  EvaluationEvent,
  EvaluationResult,
} from '../../model';

type RuleEvaluationOverviewProps = {
  readonly evaluationResult: EvaluationResult | null;
  readonly events: readonly EvaluationEvent[];
  readonly onEvaluate: () => void;
  readonly onValidate: () => void;
  readonly onDispose: () => void;
  readonly validationMessage: string | null;
};

/**
 * Rule Evaluation Overview (EPIC-BLD-17).
 * Preview of evaluation results — no Story, Runtime, or AI.
 */
export function RuleEvaluationOverview({
  evaluationResult,
  events,
  onEvaluate,
  onValidate,
  onDispose,
  validationMessage,
}: RuleEvaluationOverviewProps) {
  return (
    <div className="space-y-8" data-testid="rule-evaluation-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Rule Evaluation
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {evaluationResult?.metadata.title ?? 'Evaluation Result'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            {evaluationResult !== null
              ? `${evaluationResult.id} · model ${evaluationResult.decisionModelId}`
              : 'Vyžaduje Decision Model — výstup je Evaluation Result, ne Story.'}
          </p>
          <p className="mt-2 text-[13px] text-builder-muted">
            Engine pouze vyhodnocuje pravidla. Nemění DecisionModel, nevytváří
            Runtime ani AI Context.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEvaluate}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
          >
            Evaluate Rules
          </button>
          <button
            type="button"
            onClick={onValidate}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={onDispose}
            disabled={evaluationResult === null}
            className="rounded-[10px] border border-[#DDE5EF] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Dispose
          </button>
        </div>
      </div>

      {validationMessage !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {validationMessage}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryTile
          label="Total"
          value={`${evaluationResult?.summary.total ?? 0}`}
        />
        <SummaryTile
          label="Passed"
          value={`${evaluationResult?.summary.passed ?? 0}`}
        />
        <SummaryTile
          label="Failed"
          value={`${evaluationResult?.summary.failed ?? 0}`}
        />
        <SummaryTile
          label="Skipped"
          value={`${evaluationResult?.summary.skipped ?? 0}`}
        />
        <SummaryTile
          label="Avg Score"
          value={`${evaluationResult?.summary.averageScore ?? 0}`}
        />
      </div>

      <section aria-labelledby="rules-eval-heading">
        <h3
          id="rules-eval-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Rules
        </h3>
        <p className="mt-1 text-[13px] text-builder-muted">
          Status · Matched Signals · Score
        </p>
        {evaluationResult === null || evaluationResult.ruleResults.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">
            Spusťte Evaluate Rules (nejprve Build Decision Model).
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {evaluationResult.ruleResults.map((result) => (
              <li
                key={result.ruleId}
                className="rounded-[12px] border border-[#DDE5EF] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-builder-ink">
                    {result.ruleId}
                  </p>
                  <span
                    className={`rounded-[8px] px-2.5 py-1 text-[12px] font-medium ${
                      result.status === 'Passed'
                        ? 'bg-builder-navy text-white'
                        : result.status === 'Failed'
                          ? 'border border-[#DDE5EF] text-builder-ink'
                          : 'border border-dashed border-[#DDE5EF] text-builder-muted'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-builder-muted">
                  IF {result.metadata.condition}
                </p>
                <p className="mt-1 text-[13px] text-builder-muted">
                  THEN {result.metadata.outcome}
                </p>
                <p className="mt-2 text-[12px] text-builder-muted">
                  score {result.score} · signals:{' '}
                  {result.matchedSignals.join(', ') || '—'}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  {result.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="eval-summary-heading">
        <h3
          id="eval-summary-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Summary
        </h3>
        {evaluationResult === null ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím bez výsledku.</p>
        ) : (
          <pre className="mt-3 overflow-x-auto rounded-[12px] border border-[#DDE5EF] bg-white p-4 text-[12px] leading-relaxed text-builder-ink">
            {JSON.stringify(evaluationResult.summary, null, 2)}
          </pre>
        )}
      </section>

      <section aria-labelledby="eval-history-heading">
        <h3
          id="eval-history-heading"
          className="text-base font-semibold text-builder-ink"
        >
          Historie relace
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatím žádné události.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 12).map((event) => (
              <li
                key={event.eventId}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <div>
                  <span className="font-medium text-builder-ink">
                    {event.type}
                  </span>
                  <span className="mt-0.5 block text-builder-muted">
                    {event.message}
                  </span>
                </div>
                <time className="shrink-0 text-[11px] text-builder-muted">
                  {new Date(event.at).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#DDE5EF] px-4 py-3">
      <p className="text-[12px] uppercase tracking-wide text-builder-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-builder-ink">{value}</p>
    </div>
  );
}
