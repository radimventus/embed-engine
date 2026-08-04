import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';

/**
 * CAP-OP-01 — Project Context bar (Obchodní případ + Select + (+)).
 * Selecting a project switches the whole Pilot Workspace context.
 */
export function PilotProjectSelector() {
  const {
    cases,
    activeCaseId,
    selectCase,
    createCasePlaceholder,
  } = usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-ws__project-bar"
      data-testid="pilot-project-selector"
    >
      <div className="office-pilot-ws__project-copy">
        <p className="office-dashboard__eyebrow">Obchodní případ</p>
        <label className="office-pilot-ws__project-label" htmlFor="pilot-project-select">
          Select Project
        </label>
      </div>

      <div className="office-pilot-ws__project-controls">
        <select
          id="pilot-project-select"
          className="office-pilot-ws__project-select"
          data-testid="pilot-project-select"
          value={activeCaseId ?? ''}
          onChange={(event) => {
            const next = event.target.value;
            selectCase(next.length > 0 ? next : null);
          }}
        >
          <option value="">— vyberte obchodní případ —</option>
          {cases.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="platform-btn platform-btn--secondary office-pilot-ws__project-add"
          data-testid="pilot-project-add"
          aria-label="Přidat obchodní případ"
          title="Přidat obchodní případ"
          onClick={createCasePlaceholder}
        >
          (+)
        </button>
      </div>
    </div>
  );
}
