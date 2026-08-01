import { useMemo, useState, type FormEvent } from 'react';

import {
  buildProductLearningReport,
  registerLearningFeedback,
} from '@embed-engine/product-learning';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { PRODUCT_LEARNING_SECTION_IDS } from './productLearningVocabulary';

type ProductLearningCanvasProps = {
  /** PR-026 — partner UI shows Manažerské shrnutí + Produktové poznatky. */
  readonly partnerOnly?: boolean;
};

/**
 * EPIC-BX-20 — Manager projection of Product Learning capability.
 */
export function ProductLearningCanvas({
  partnerOnly = false,
}: ProductLearningCanvasProps) {
  const { session, bootstrap } = usePlatformSession();
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState('');
  const report = useMemo(() => {
    void tick;
    return buildProductLearningReport();
  }, [tick, session?.companyId]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (message.trim().length === 0 || bootstrap === null) return;
    registerLearningFeedback({
      message: message.trim(),
      companyId: bootstrap.company.id,
      workspaceId: bootstrap.workspace.id,
      projectId: bootstrap.project?.id ?? null,
      studioId: 'manager',
      source: 'learning',
    });
    setMessage('');
    setTick((value) => value + 1);
  };

  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="product-learning-canvas"
      data-capability="product-learning"
    >
      <OperationsSurface
        id={PRODUCT_LEARNING_SECTION_IDS.executive}
        title="Manažerské shrnutí"
        description="Poznatky z pilota · top doporučení · rizika · příležitosti."
      >
        <p className="text-lg font-semibold text-[var(--platform-navy)]">
          {report.executive.pilotLearnings}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Top 10 doporučení
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.topRecommendations.map((item) => (
                <li
                  key={item}
                  className="text-sm text-[var(--platform-navy)]"
                >
                  {item}
                </li>
              ))}
              {report.executive.topRecommendations.length === 0 && (
                <li className="text-sm text-[var(--platform-navy)]">
                  Zatím žádný feedback.
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Největší rizika
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.greatestRisks.map((item) => (
                <li
                  key={item}
                  className="text-sm text-[var(--platform-navy)]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Největší příležitosti
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.greatestOpportunities.map((item) => (
                <li
                  key={item}
                  className="text-sm text-[var(--platform-navy)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </OperationsSurface>

      <OperationsSurface
        id={PRODUCT_LEARNING_SECTION_IDS.insights}
        title="Produktové poznatky"
        description="Nejčastější podněty · schopnosti · Studia · trendy pilotů."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Nejčastější podněty
            </p>
            <ul className="mt-2 space-y-2">
              {report.insights.topThemes.map((theme) => (
                <li key={theme.id} className="text-sm">
                  <span className="font-medium">{theme.category}</span>
                  {' · '}
                  {theme.frequency}× · {theme.theme}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Schopnosti / Studia
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--platform-navy)]">
              {report.insights.capabilitiesAffected.slice(0, 5).map((item) => (
                <li key={item.capabilityId}>
                  {item.capabilityId} · {item.count}
                </li>
              ))}
              {report.insights.studiosAffected.slice(0, 5).map((item) => (
                <li key={item.studioId}>
                  Studio {item.studioId} · {item.count}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Trendy podle pilotů
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--platform-navy)]">
              {report.insights.pilotTrends.map((trend) => (
                <li key={trend.companyId}>
                  {trend.companyName} · {trend.count} ·{' '}
                  {trend.topCategory ?? '—'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </OperationsSurface>

      {!partnerOnly && (
        <>
          <OperationsSurface
            id={PRODUCT_LEARNING_SECTION_IDS.recommendations}
            title="Pipeline doporučení"
            description="Četnost · dopad · priorita — deterministická pravidla."
          >
            <ul className="space-y-3">
              {report.recommendations.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-embed-border-default pb-3"
                >
                  <p className="text-sm font-medium text-[var(--platform-navy)]">
                    {item.theme}
                  </p>
                  <p className="mt-1 text-xs text-[var(--platform-navy)]">
                    {item.category} · {item.frequency}× · {item.impact} ·{' '}
                    {item.priority}
                  </p>
                </li>
              ))}
            </ul>
          </OperationsSurface>

          <OperationsSurface
            id={PRODUCT_LEARNING_SECTION_IDS.roadmap}
            title="Návrhy roadmapy"
            description="Vysoký / střední / nízký dopad — doporučení, ne automatická roadmapa."
          >
            <ul className="space-y-3">
              {report.roadmapSuggestions.map((item) => (
                <li
                  key={item.id}
                  className="rounded-sm border border-embed-border-default px-3 py-3"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--platform-navy)]">
                    {item.rationale}
                  </p>
                </li>
              ))}
              {report.roadmapSuggestions.length === 0 && (
                <p className="text-sm text-[var(--platform-navy)]">
                  Zatím žádná roadmap doporučení.
                </p>
              )}
            </ul>
          </OperationsSurface>

          <OperationsSurface
            id={PRODUCT_LEARNING_SECTION_IDS.registry}
            title="Registr zpětné vazby"
            description="Navázáno na firmu / workspace / projekt / studio / schopnost / release."
          >
            <form className="mb-4 grid gap-2" onSubmit={onSubmit}>
              <label className="text-xs font-semibold text-[var(--platform-navy)]">
                Nový podnět (Product Owner / Admin)
                <textarea
                  className="mt-1 w-full rounded-sm border border-embed-border-default bg-white px-3 py-2 text-sm"
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="např. UX: preview navigace je matoucí"
                />
              </label>
              <button
                type="submit"
                className="w-fit rounded-sm bg-embed-brand-navy px-3 py-2 text-sm font-medium text-white"
              >
                Zaznamenat zpětnou vazbu
              </button>
            </form>
            <ul className="space-y-3">
              {report.entries.slice(0, 20).map((entry) => (
                <li
                  key={entry.id}
                  className="border-b border-embed-border-default pb-2 text-sm"
                >
                  <p className="font-medium text-[var(--platform-navy)]">
                    {entry.category} · {entry.message}
                  </p>
                  <p className="mt-1 text-xs text-[var(--platform-navy)]">
                    {entry.companyId} / {entry.workspaceId} /{' '}
                    {entry.projectId ?? '—'} · {entry.studioId ?? '—'} ·{' '}
                    {entry.capabilityId ?? '—'} · {entry.releaseLabel ?? '—'}
                  </p>
                </li>
              ))}
            </ul>
          </OperationsSurface>
        </>
      )}
    </div>
  );
}
