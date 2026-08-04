import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';

/**
 * CAP-OP-10A — Global Project Context (left-rail PROJEKTY block).
 * Selecting a project switches Working Terminal + Workflow + Conversation.
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
      className="office-sidebar__projects"
      data-testid="pilot-project-selector"
      data-office-project-context="global"
    >
      <p className="office-sidebar__projects-eyebrow">Projekty</p>
      <label className="office-sidebar__projects-label" htmlFor="pilot-project-select">
        Select Project
      </label>

      <div className="office-sidebar__projects-controls">
        <select
          id="pilot-project-select"
          className="office-sidebar__projects-select"
          data-testid="pilot-project-select"
          value={activeCaseId ?? ''}
          onChange={(event) => {
            const next = event.target.value;
            selectCase(next.length > 0 ? next : null);
          }}
        >
          <option value="">— vyberte projekt —</option>
          {cases.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="platform-btn platform-btn--secondary office-sidebar__projects-add"
          data-testid="pilot-project-add"
          aria-label="Přidat projekt"
          title="Přidat projekt"
          onClick={createCasePlaceholder}
        >
          (+)
        </button>
      </div>
    </div>
  );
}
