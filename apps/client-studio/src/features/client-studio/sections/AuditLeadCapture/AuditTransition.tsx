import { AUDIT_ACCENT, AUDIT_WHITE } from './audit-panel';
import { resolveAuditHero } from './auditHeroPresentation';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

/**
 * Block 1 — dominant hero.
 * Intelligence may change only title, subtitle, and gold highlight (AUD-02).
 */
export function AuditTransition() {
  const { experience } = useDecisionSessionRuntime();
  const decision = experience.context.decision;
  const hero = resolveAuditHero({
    recommendation: decision.terminal.outcome.recommendation,
    priorityIds: decision.priorityIds,
  });

  return (
    <div className="mx-auto w-full max-w-[61.6rem] px-section pb-10 pt-14 text-center mobile:pb-8 mobile:pt-12">
      <h1
        className="font-sans text-5xl font-bold leading-[1.1] tracking-tight mobile:!text-[1.92rem] mobile:leading-tight mobile:whitespace-nowrap"
        style={{ color: AUDIT_WHITE }}
        data-testid="audit-hero-title"
      >
        {hero.title}
      </h1>

      <p
        className="mx-auto mt-7 max-w-[52.8rem] font-sans text-xl font-normal leading-snug text-white/90 mobile:mt-5 mobile:mx-0 mobile:w-full mobile:max-w-none mobile:text-[16.2px]"
        data-testid="audit-hero-subtitle"
      >
        {hero.subtitle}
      </p>

      <p
        className="mx-auto mt-5 max-w-[52.8rem] font-sans text-xl font-semibold leading-snug mobile:mx-0 mobile:w-full mobile:max-w-none mobile:text-[16.2px]"
        style={{ color: AUDIT_ACCENT }}
        data-testid="audit-hero-highlight"
      >
        {hero.highlight}
      </p>
    </div>
  );
}
