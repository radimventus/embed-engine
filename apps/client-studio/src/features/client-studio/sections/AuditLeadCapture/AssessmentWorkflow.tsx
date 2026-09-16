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
        className="mt-6 flex items-center justify-center gap-3 mobile:hidden"
        data-testid="audit-workflow-mode"
      >
        <ModeIcon className="h-8 w-8" />
        <p
          className="whitespace-nowrap text-center text-xs font-bold tracking-[0.14em]"
          style={{ color: AUDIT_ACCENT }}
        >
          {mode.label}
        </p>
      </div>

      <div className="relative mt-8" role="list" aria-label="Stanice posouzení">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[12.5%] right-[37.5%] top-[44px] h-px mobile:hidden"
          style={{ backgroundColor: AUDIT_ACCENT }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[62.5%] right-[12.5%] top-[44px] border-t border-dashed mobile:hidden"
          style={{ borderColor: AUDIT_ACCENT }}
        />

        <div className="grid grid-cols-4 gap-4 mobile:hidden">
          {stations.map((station, index) => (
            <div
              key={`${station.motif}-${station.title}`}
              role="listitem"
              className="relative z-10 flex flex-col items-center text-center mobile:text-left"
              data-testid="audit-workflow-step"
            >
              <div
                className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 bg-[#001930]"
                style={{ borderColor: AUDIT_ACCENT }}
              >
                <StationMotifIcon motif={station.motif} className="h-12 w-12" />
              </div>
              <p className="mt-5 text-sm font-semibold tracking-wide mobile:w-full">
                <span style={{ color: AUDIT_ACCENT }}>
                  {String(index + 1).padStart(2, '0')}{' '}
                </span>
                <span style={{ color: AUDIT_WHITE }}>{station.title}</span>
              </p>
              <p
                className="mt-1.5 text-[13px] leading-snug mobile:w-full"
                style={{ color: AUDIT_MUTED }}
              >
                {station.lines.join(' ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
