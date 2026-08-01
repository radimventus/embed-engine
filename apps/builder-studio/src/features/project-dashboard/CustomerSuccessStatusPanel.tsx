import { useMemo } from 'react';

import { analyzeCustomerSuccess } from '@embed-engine/customer-success';
import { usePlatformSession } from '@embed-engine/platform-access';

/**
 * EPIC-BX-17 — Builder only shows relevant Customer Success status.
 */
export function CustomerSuccessStatusPanel() {
  const { session } = usePlatformSession();
  const report = useMemo(
    () => analyzeCustomerSuccess({ session }),
    [session],
  );

  if (report === null) return null;

  return (
    <section
      className="mt-5 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-3 py-3"
      data-testid="customer-success-status"
      data-capability="customer-success"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Customer Success
      </p>
      <p className="mt-1 text-sm font-semibold text-builder-ink">
        {report.health} · {report.adoptionScore}%
      </p>
      <p className="mt-1 text-[12px] text-builder-muted">
        Onboarding {report.onboardingCompleteCount}/{report.onboardingTotal} ·{' '}
        {report.healthDetail}
      </p>
    </section>
  );
}
