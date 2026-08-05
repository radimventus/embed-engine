import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';

type PilotProjectSelectorProps = {
  /** R-001 — Enter Working Terminal when a project is activated. */
  readonly onEnterWorkSurface?: () => void;
};

/**
 * CAP-OP-10A / R-001 / PT-VR-01A — Global Project Context (left-rail PROJEKTY).
 * Always keeps an active project — never an empty work surface.
 */
export function PilotProjectSelector({
  onEnterWorkSurface,
}: PilotProjectSelectorProps) {
  const {
    cases,
    activeCaseId,
    selectCase,
    createCasePlaceholder,
  } = usePilotWorkspaceContext();

  const selectedId =
    activeCaseId ?? (cases.length > 0 ? cases[0]!.id : '');

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
          value={selectedId}
          onChange={(event) => {
            const next = event.target.value;
            if (next.length === 0) return;
            selectCase(next);
            onEnterWorkSurface?.();
          }}
        >
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
          onClick={() => {
            createCasePlaceholder();
            onEnterWorkSurface?.();
          }}
        >
          (+)
        </button>
      </div>
    </div>
  );
}
