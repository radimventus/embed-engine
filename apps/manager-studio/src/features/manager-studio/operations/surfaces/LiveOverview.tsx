import { useManagerStudioRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { OPERATIONS_SECTION_IDS } from '../operationsVocabulary';
import { OperationsSurface } from '../OperationsSurface';

export function LiveOverview() {
  const runtime = useManagerStudioRuntime();
  if (!runtime.ready) return null;
  const { overview } = runtime.operations;

  return (
    <OperationsSurface
      id={OPERATIONS_SECTION_IDS.overview}
      title="Živý přehled"
      description="Aktuální stav rozhodovací relace — projekce provozního jádra, bez lokální interpretace."
    >
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Objekt" value={overview.objectTitle} />
        <Fact label="ID objektu" value={overview.objectId} />
        <Fact label="Události" value={String(overview.eventCount)} />
        <Fact
          label="Poslední událost"
          value={overview.lastEventType ?? 'Žádná'}
        />
        <Fact
          label="Aktivní místnost"
          value={overview.activeRoomId ?? '—'}
        />
        <Fact
          label="Výsledek"
          value={overview.outcomeStatus ?? '—'}
        />
      </dl>
    </OperationsSurface>
  );
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="border border-embed-border-default bg-embed-background-secondary px-3 py-2">
      <dt className="text-xs text-[var(--platform-navy)]">{label}</dt>
      <dd className="mt-1 text-sm text-[var(--platform-navy)]">{value}</dd>
    </div>
  );
}
