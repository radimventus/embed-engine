import { formatDecisionKeyCs, formatPriorityIdCs } from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  AUDIT_ACCENT,
  AUDIT_MUTED,
  AUDIT_PANEL_MAX_WIDTH_CLASS,
  AUDIT_WHITE,
} from './audit-panel';

export type ConversionRuntimeSnapshot = {
  readonly recommendation: string;
  readonly status: string;
  readonly focusRoomName: string | null;
  readonly focusReason: string;
  readonly priorityIds: readonly string[];
  readonly recommendedNextAction: string;
  readonly terminalId: string;
};

export function buildConversionRuntimeSnapshot(input: {
  readonly recommendation: string;
  readonly status: string;
  readonly focusRoomName: string | null;
  readonly focusReason: string;
  readonly priorityIds: readonly string[];
  readonly recommendedNextAction: string;
  readonly terminalId: string;
}): ConversionRuntimeSnapshot {
  return Object.freeze({
    recommendation: input.recommendation,
    status: input.status,
    focusRoomName: input.focusRoomName,
    focusReason: input.focusReason,
    priorityIds: Object.freeze([...input.priorityIds]),
    recommendedNextAction: input.recommendedNextAction,
    terminalId: input.terminalId,
  });
}

export function useConversionRuntimeSnapshot(): ConversionRuntimeSnapshot {
  const { experience } = useDecisionSessionRuntime();
  const decision = experience.context.decision;
  const outcome = decision.terminal.outcome;
  return buildConversionRuntimeSnapshot({
    recommendation: outcome.recommendation,
    status: outcome.status,
    focusRoomName: decision.focus.focusRoomName,
    focusReason: decision.focus.focusReason,
    priorityIds: decision.priorityIds,
    recommendedNextAction: outcome.recommendedNextAction,
    terminalId: decision.terminal.id,
  });
}

export function formatSnapshotForMailto(
  snapshot: ConversionRuntimeSnapshot,
): string {
  const priorities =
    snapshot.priorityIds.length === 0
      ? '—'
      : snapshot.priorityIds.map(formatPriorityIdCs).join(', ');
  const focus =
    snapshot.focusRoomName !== null
      ? `${snapshot.focusRoomName} · ${formatDecisionKeyCs(snapshot.focusReason)}`
      : formatDecisionKeyCs(snapshot.focusReason);

  return [
    '--- Kontext rozhodnutí (Runtime) ---',
    `Doporučení: ${formatDecisionKeyCs(snapshot.recommendation)}`,
    `Stav: ${formatOutcomeStatusCs(snapshot.status)}`,
    `Fokus: ${focus}`,
    `Priority: ${priorities}`,
    `Další krok: ${formatDecisionKeyCs(snapshot.recommendedNextAction)}`,
    `Terminal: ${snapshot.terminalId}`,
  ].join('\n');
}

export function ConversionContextStrip() {
  const snapshot = useConversionRuntimeSnapshot();
  const priorities =
    snapshot.priorityIds.length === 0
      ? 'Zatím bez priorit'
      : snapshot.priorityIds.map(formatPriorityIdCs).join(' · ');

  return (
    <div
      className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} px-section`}
      data-testid="conversion-context"
      data-terminal-id={snapshot.terminalId}
    >
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: AUDIT_ACCENT }}
      >
        Na základě vašeho rozhodnutí
      </p>
      <p
        className="mt-2 text-center text-lg font-semibold leading-snug"
        style={{ color: AUDIT_WHITE }}
      >
        {formatDecisionKeyCs(snapshot.recommendation)}
      </p>
      <p className="mt-2 text-center text-sm" style={{ color: AUDIT_MUTED }}>
        {formatOutcomeStatusCs(snapshot.status)}
        {snapshot.focusRoomName !== null ? (
          <>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            Fokus: {snapshot.focusRoomName}
          </>
        ) : null}
      </p>
      <p className="mt-1 text-center text-xs" style={{ color: AUDIT_MUTED }}>
        Priority: {priorities}
      </p>
      <p className="mt-3 text-center text-sm font-medium" style={{ color: AUDIT_WHITE }}>
        Další krok: {formatDecisionKeyCs(snapshot.recommendedNextAction)}
      </p>
    </div>
  );
}
