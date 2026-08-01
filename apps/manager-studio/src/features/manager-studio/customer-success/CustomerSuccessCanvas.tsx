import { useMemo } from 'react';

import { analyzeCustomerSuccess } from '@embed-engine/customer-success';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { CUSTOMER_SUCCESS_SECTION_IDS } from './customerSuccessVocabulary';

/**
 * EPIC-BX-17 — Manager projection of the Customer Success capability.
 */
export function CustomerSuccessCanvas() {
  const { session } = usePlatformSession();
  const report = useMemo(
    () => analyzeCustomerSuccess({ session }),
    [session],
  );

  if (report === null) {
    return (
      <div className="w-full max-w-5xl px-section py-section" data-capability="customer-success">
        <p className="text-sm text-embed-foreground-primary/60">
          Customer Success — chybí Company / Workspace kontext.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="customer-success-canvas"
      data-capability="customer-success"
    >
      <OperationsSurface
        id={CUSTOMER_SUCCESS_SECTION_IDS.adoption}
        title="Adoption Score"
        description="Deterministická adopce z onboarding kroků, aktivity, publish a capability."
      >
        <p className="text-4xl font-semibold tracking-tight text-embed-foreground-primary">
          {report.adoptionScore} %
        </p>
        <p className="mt-2 text-sm text-embed-foreground-primary/60">
          {report.companyName} · {report.workspaceName}
        </p>
      </OperationsSurface>

      <OperationsSurface
        id={CUSTOMER_SUCCESS_SECTION_IDS.health}
        title="Customer Health"
        description="Healthy · Attention · At Risk — stejná capability jako Builder status."
      >
        <p className="text-2xl font-semibold text-embed-foreground-primary">
          {report.health}
        </p>
        <p className="mt-2 text-sm text-embed-foreground-primary/60">
          {report.healthDetail}
        </p>
      </OperationsSurface>

      <OperationsSurface
        id={CUSTOMER_SUCCESS_SECTION_IDS.onboarding}
        title="Onboarding Journey"
        description={`${report.onboardingCompleteCount}/${report.onboardingTotal} kroků complete.`}
      >
        <ul className="space-y-3">
          {report.onboarding.map((step) => (
            <li
              key={step.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-embed-border-default pb-2"
            >
              <span className="text-sm font-medium text-embed-foreground-primary">
                {step.label}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-embed-brand-navy">
                {step.state}
              </span>
              <span className="w-full text-xs text-embed-foreground-primary/55">
                {step.detail}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={CUSTOMER_SUCCESS_SECTION_IDS.timeline}
        title="Success Timeline"
        description="Chronologie důležitých událostí zákazníka."
      >
        <ul className="space-y-3">
          {report.timeline.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-embed-border-default pb-2"
            >
              <span className="text-sm font-medium text-embed-foreground-primary">
                {event.label}
              </span>
              <span className="text-xs text-embed-foreground-primary/55">
                {event.occurred ? event.at ?? 'ano' : '—'}
              </span>
              <span className="w-full text-xs text-embed-foreground-primary/55">
                {event.detail}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={CUSTOMER_SUCCESS_SECTION_IDS.recommendations}
        title="Success Recommendations"
        description="Každé doporučení vede na konkrétní místo v platformě."
      >
        <ul className="space-y-3">
          {report.recommendations.map((item) => (
            <li
              key={item.id}
              className="rounded-sm border border-embed-border-default bg-embed-background-primary px-3 py-3"
            >
              <p className="text-sm font-medium text-embed-foreground-primary">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-embed-foreground-primary/60">
                {item.detail}
              </p>
              <a
                href={item.href}
                className="mt-2 inline-block text-xs font-semibold text-embed-brand-navy underline"
              >
                {item.targetLabel} →
              </a>
            </li>
          ))}
          {report.recommendations.length === 0 && (
            <p className="text-sm text-embed-foreground-primary/60">
              Žádná otevřená doporučení — zákazník je v dobré kondici.
            </p>
          )}
        </ul>
      </OperationsSurface>
    </div>
  );
}
