import { useManagerStudioRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { OPERATIONS_SECTION_IDS } from '../operationsVocabulary';
import { OperationsSurface } from '../OperationsSurface';

export function Timeline() {
  const { operations } = useManagerStudioRuntime();
  const { timeline } = operations;

  return (
    <OperationsSurface
      id={OPERATIONS_SECTION_IDS.timeline}
      title="Časová osa"
      description="Chronologická projekce Runtime DecisionEvent — bez UI gest."
    >
      {timeline.length === 0 ? (
        <p className="text-sm text-embed-foreground-primary/55">
          Zatím žádné Runtime události. Session je připravena.
        </p>
      ) : (
        <ol className="space-y-2">
          {timeline.map((entry, index) => (
            <li
              key={`${entry.type}-${entry.at}-${index}`}
              className="flex items-baseline justify-between gap-4 border-b border-embed-border-default py-2 text-sm"
            >
              <span className="font-medium text-embed-foreground-primary">
                {entry.type}
              </span>
              <time className="shrink-0 text-xs text-embed-foreground-primary/45">
                t={entry.at}
              </time>
            </li>
          ))}
        </ol>
      )}
    </OperationsSurface>
  );
}
