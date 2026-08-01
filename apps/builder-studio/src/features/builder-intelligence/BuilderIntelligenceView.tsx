import { useMemo, useState } from 'react';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import {
  buildBuilderIntelligenceModel,
  getCoachLabel,
  INTELLIGENCE_COACHES,
  type BuilderCoachReport,
  type BuilderIntelligenceRecommendation,
} from './builderIntelligenceAdapter';
import type {
  RecommendationSeverity,
  RuleCategory,
} from '@embed-engine/intelligence';

type BuilderIntelligenceViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly onNavigate: (nav: HousePackageNavId) => void;
};

/**
 * EPIC-BX-09 / BX-12 — Builder Intelligence UI over shared Intelligence Core.
 */
export function BuilderIntelligenceView({
  projectId,
  projectName,
  snapshot,
  validationReport,
  onNavigate,
}: BuilderIntelligenceViewProps) {
  const [coachId, setCoachId] = useState<RuleCategory>('quality');

  const model = useMemo(
    () =>
      buildBuilderIntelligenceModel({
        projectId,
        snapshot,
        validationReport,
      }),
    [projectId, snapshot, validationReport],
  );

  const activeCoach =
    model.coaches.find((coach) => coach.id === coachId) ?? model.coaches[0];

  return (
    <div className="space-y-5" data-testid="builder-intelligence">
      <header className="rounded-[16px] border border-[#E3E3E3] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Builder Intelligence
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
          Builder Coach
        </h1>
        <p className="mt-1 text-sm text-builder-muted">
          {projectName} — Decision Intelligence Core (sdílená platformní
          vrstva).
        </p>
        <div className="mt-5 grid gap-3 tablet:grid-cols-4">
          {INTELLIGENCE_COACHES.map((coach) => {
            const report = model.coaches.find((item) => item.id === coach.id);
            const active = coach.id === coachId;
            return (
              <button
                key={coach.id}
                type="button"
                onClick={() => setCoachId(coach.id)}
                className={`rounded-[12px] border px-3 py-3 text-left ${
                  active
                    ? 'border-builder-navy bg-builder-navy text-white'
                    : 'border-[#E3E3E3] bg-builder-canvas text-builder-ink'
                }`}
              >
                <p className="text-sm font-semibold">{coach.label}</p>
                <p
                  className={`mt-1 text-[11px] ${
                    active ? 'text-white/80' : 'text-builder-muted'
                  }`}
                >
                  Skóre {report?.score ?? 0} · {report?.findings.length ?? 0}{' '}
                  nálezů
                </p>
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid gap-4 desktop:grid-cols-[280px_minmax(0,1fr)]">
        <DecisionReadinessCard readiness={model.readiness} />
        <CoachDetail coach={activeCoach} onNavigate={onNavigate} />
      </div>

      <RecommendationsPanel
        recommendations={model.recommendations}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function DecisionReadinessCard({
  readiness,
}: {
  readonly readiness: ReturnType<
    typeof buildBuilderIntelligenceModel
  >['readiness'];
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Decision Readiness
      </p>
      <p className="mt-3 text-4xl font-semibold text-builder-ink">
        {readiness.score} %
      </p>
      <p className="mt-1 text-lg font-semibold text-builder-navy">
        Grade {readiness.grade}
      </p>
      <ul className="mt-4 space-y-2">
        {readiness.pillars.map((pillar) => (
          <li key={pillar.id}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-builder-muted">{pillar.label}</span>
              <span className="font-medium text-builder-ink">{pillar.score}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#E3E3E3]">
              <div
                className="h-full rounded-full bg-builder-navy"
                style={{ width: `${pillar.score}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoachDetail({
  coach,
  onNavigate,
}: {
  readonly coach: BuilderCoachReport;
  readonly onNavigate: (nav: HousePackageNavId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">
            {coach.label}
          </h2>
          <p className="mt-1 text-sm text-builder-muted">{coach.description}</p>
        </div>
        <p className="rounded-[10px] border border-[#E3E3E3] bg-builder-canvas px-3 py-1.5 text-sm font-semibold text-builder-ink">
          {coach.score} / 100
        </p>
      </div>
      {coach.findings.length === 0 ? (
        <p className="mt-5 text-sm text-builder-success">
          Žádná doporučení — tato oblast vypadá dobře.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {coach.findings.map((finding) => (
            <li key={finding.id}>
              <button
                type="button"
                onClick={() => onNavigate(finding.nav)}
                className="flex w-full items-start gap-3 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-4 py-3 text-left hover:border-builder-navy/40"
              >
                <SeverityMark severity={finding.severity} />
                <span>
                  <span className="block text-sm font-semibold text-builder-ink">
                    {finding.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-builder-muted">
                    {finding.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecommendationsPanel({
  recommendations,
  onNavigate,
}: {
  readonly recommendations: readonly BuilderIntelligenceRecommendation[];
  readonly onNavigate: (nav: HousePackageNavId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Recommendations
      </p>
      <p className="mt-1 text-sm text-builder-muted">
        Deterministická doporučení — klik otevře příslušný editor.
      </p>
      {recommendations.length === 0 ? (
        <p className="mt-4 text-sm text-builder-success">
          Builder nemá další doporučení.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {recommendations.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.nav)}
                className="flex w-full items-start justify-between gap-3 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-4 py-3 text-left hover:border-builder-navy/40"
              >
                <span className="flex items-start gap-3">
                  <SeverityMark severity={item.severity} />
                  <span>
                    <span className="block text-sm font-semibold text-builder-ink">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-builder-muted">
                      {item.detail}
                    </span>
                    <span className="mt-1 block text-[11px] text-builder-navy">
                      {getCoachLabel(item.coachId)} → otevřít editor
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SeverityMark({
  severity,
}: {
  readonly severity: RecommendationSeverity;
}) {
  const label =
    severity === 'high' ? '!' : severity === 'medium' ? '⚠' : 'i';
  return (
    <span
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
        severity === 'high'
          ? 'bg-builder-draftBg text-builder-draft'
          : severity === 'medium'
            ? 'bg-amber-50 text-amber-800'
            : 'bg-[#E3E3E3] text-builder-muted'
      }`}
    >
      {label}
    </span>
  );
}
