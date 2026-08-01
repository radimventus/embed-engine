import { useManagerStudioRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { OPERATIONS_SECTION_IDS } from '../operationsVocabulary';
import { OperationsSurface } from '../OperationsSurface';

/**
 * Attention queue foundation — surfaces Runtime outcome status only.
 * Does not invent alert rules or scoring.
 */
export function AttentionQueue() {
  const { operations } = useManagerStudioRuntime();
  const status = operations.overview.outcomeStatus;
  const needsAttention = status === null || status === 'in-progress';

  const attentionLabel = needsAttention
    ? 'Session vyžaduje provozní pozornost (outcome neuzavřen).'
    : 'Žádné foundation attention položky z aktuální projekce.';

  return (
    <OperationsSurface
      id={OPERATIONS_SECTION_IDS.attention}
      title="Fronta pozornosti"
      description="Položky vyžadující lidskou pozornost — foundation projekce bez alert engine."
    >
      <p className="text-sm text-embed-foreground-primary/70">{attentionLabel}</p>
      <p className="mt-2 text-xs text-embed-foreground-primary/45">
        Stav výsledku: {status ?? '—'}
      </p>
    </OperationsSurface>
  );
}
