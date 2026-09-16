import {
  AUDIT_ACCENT,
  AUDIT_MUTED,
  AUDIT_PANEL_MAX_WIDTH_CLASS,
  AUDIT_WHITE,
  WORKFLOW_BY_LAND,
  type LandOption,
} from './audit-panel';
import { HouseIcon, SearchIcon, StationMotifIcon } from './AuditIcons';

export const AUDIT_ASSESSMENT_WORKFLOW_ID = 'audit-assessment-workflow';

type AssessmentWorkflowProps = {
  landOption: LandOption;
};

const MODE_META: Record<LandOption, { label: string; Icon: typeof HouseIcon }> =
  {
    owned: { label: 'MÁM POZEMEK', Icon: HouseIcon },
    seeking: { label: 'HLEDÁM POZEMEK', Icon: SearchIcon },
  };

/** Block 3 — metro product; only the active mode branch is visible. */
export function AssessmentWorkflow({ landOption }: AssessmentWorkflowProps) {
  const stations = WORKFLOW_BY_LAND[landOption];
  const mode = MODE_META[landOption];
  const ModeIcon = mode.Icon;

  return (
    <div
      id={AUDIT_ASSESSMENT_WORKFLOW_ID}
      className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} px-section`}
    >
      <h2 className="text-left text-base font-semibold tracking-wide mobile:mb-[10px] mobile:text-[1.1rem] mobile:leading-[1.2]">
        <span style={{ color: AUDIT_ACCENT }}>2. </span>
        <span style={{ color: AUDIT_WHITE }}>Jak probíhá posouzení</span>
      </h2>

      <div
        data-mobile-audit-workflow
        className="hidden mobile:grid mobile:grid-cols-[44px_minmax(0,1fr)] mobile:items-start mobile:gap-x-3 mobile:gap-y-4"
      >
        {stations.map((station, index) => (
          <div
            key={`mobile-${station.title}`}
            className="col-span-2 grid grid-cols-[44px_minmax(0,1fr)] items-start gap-x-3"
          >
            <div className="flex min-h-10 items-start justify-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border"
                style={{ borderColor: AUDIT_ACCENT }}
              >
                <StationMotifIcon
                  motif={station.motif}
                  className="h-6 w-6"
                />
              </div>
            </div>

            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold tracking-wide">
                <span style={{ color: AUDIT_ACCENT }}>
                  {String(index + 1).padStart(2, '0')}{' '}
                </span>
                <span style={{ color: AUDIT_WHITE }}>
                  {station.title}
                </span>
              </p>
              <p
                className="mt-1 text-[13px] leading-snug"
                style={{ color: AUDIT_MUTED }}
              >
                {station.lines.join(' ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 grid grid-cols-[9.5rem_1px_minmax(0,1fr)] items-center gap-x-5 mobile:hidden"
        data-testid="audit-workflow-desktop"
      >
        <div
          className="flex flex-col items-center justify-center gap-3"
          data-testid="audit-workflow-mode"
        >
          <ModeIcon className="h-8 w-8" />
          <p
            className="whitespace-nowrap text-center text-[11px] font-bold tracking-[0.14em]"
            style={{ color: AUDIT_ACCENT }}
          >
            {mode.label}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="h-[72px] w-px"
          style={{ backgroundColor: AUDIT_ACCENT }}
          data-testid="audit-workflow-mode-divider"
        />

        <div className="relative" role="list" aria-label="Stanice posouzení">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12.5%] right-[37.5%] top-7 h-px"
            style={{ backgroundColor: AUDIT_ACCENT }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[62.5%] right-[12.5%] top-7 border-t border-dashed"
            style={{ borderColor: AUDIT_ACCENT }}
          />

          <div className="grid grid-cols-4 gap-3">
            {stations.map((station, index) => (
              <div
                key={`${station.motif}-${station.title}`}
                role="listitem"
                className="relative z-10 flex min-w-0 flex-col items-center text-center"
                data-testid="audit-workflow-step"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border bg-[#001930]"
                  style={{ borderColor: AUDIT_ACCENT }}
                >
                  <StationMotifIcon motif={station.motif} className="h-7 w-7" />
                </div>
                <p className="mt-3 text-xs font-semibold tracking-wide">
                  <span style={{ color: AUDIT_ACCENT }}>
                    {String(index + 1).padStart(2, '0')}{' '}
                  </span>
                  <span style={{ color: AUDIT_WHITE }}>{station.title}</span>
                </p>
                <p
                  className="mt-1 max-w-[10.5rem] text-[11px] leading-snug"
                  style={{ color: AUDIT_MUTED }}
                >
                  {station.lines.join(' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
