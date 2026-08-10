import { useManagerStudioRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { OPERATIONS_SECTION_IDS } from '../operationsVocabulary';
import { OperationsSurface } from '../OperationsSurface';

export function ActiveJourneys() {
  const runtime = useManagerStudioRuntime();
  if (!runtime.ready) return null;
  const { overview } = runtime.operations;

  return (
    <OperationsSurface
      id={OPERATIONS_SECTION_IDS.journeys}
      title="Aktivní rozhodovací cesty"
      description="Sleduje se jedna certifikovaná Decision Session (pilotní objekt)."
    >
      <div className="border border-embed-border-default bg-embed-background-secondary px-4 py-3">
        <p className="text-sm font-medium text-embed-foreground-primary">
          {overview.objectTitle}
        </p>
        <p className="mt-1 text-xs text-embed-foreground-primary/55">
          Příběh: {overview.storyId ?? '—'} · Terminál: {overview.terminalId ?? '—'}
        </p>
        <p className="mt-2 text-xs text-embed-foreground-primary/45">
          Priorita:{' '}
          {overview.priorityIds.length > 0
            ? overview.priorityIds.join(', ')
            : 'žádné'}
        </p>
      </div>
    </OperationsSurface>
  );
}
