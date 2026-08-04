import { PlatformCard, PlatformEmptyState } from '@embed-engine/platform-shell';

import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import {
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotWorkspaceCase,
} from '../../office/pilotWorkspaceModel';

/**
 * CAP-OP-01 — Left Cases panel (UI list only).
 */
export function PilotCasesPanel() {
  const { cases, activeCaseId, selectCase } = usePilotWorkspaceContext();

  return (
    <PlatformCard title="Cases" className="office-pilot-ws__cases">
      {cases.length === 0 ? (
        <PlatformEmptyState
          title="Žádné obchodní případy"
          description="Vytvořte nový případ pomocí (+)."
        />
      ) : (
        <ul className="office-pilot-ws__case-list" data-testid="pilot-cases-list">
          {cases.map((item) => (
            <CaseRow
              key={item.id}
              item={item}
              active={item.id === activeCaseId}
              onSelect={() => selectCase(item.id)}
            />
          ))}
        </ul>
      )}
    </PlatformCard>
  );
}

function CaseRow({
  item,
  active,
  onSelect,
}: {
  readonly item: PilotWorkspaceCase;
  readonly active: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={
          active
            ? 'office-pilot-ws__case office-pilot-ws__case--active'
            : 'office-pilot-ws__case'
        }
        data-testid={`pilot-case-${item.id}`}
        aria-current={active ? 'true' : undefined}
        onClick={onSelect}
      >
        <span className="office-pilot-ws__case-label">{item.label}</span>
        <span className="office-pilot-ws__case-meta">
          {item.partnerName} ·{' '}
          {PILOT_WORKSPACE_CASE_STATUS_LABELS[item.status]}
        </span>
      </button>
    </li>
  );
}
