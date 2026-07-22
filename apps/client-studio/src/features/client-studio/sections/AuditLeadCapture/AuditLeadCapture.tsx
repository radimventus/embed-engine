import { useState } from 'react';

import {
  enabledCommercialCtas,
  type CommercialCtaId,
} from '../../pilot/commercialConversion';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import { useOptionalDecisionAnalytics } from '../../analytics/DecisionAnalyticsProvider';
import { AUDIT_SECTION_STYLE } from './audit-panel';
import { AuditTransition } from './AuditTransition';
import { ContactCard } from './ContactCard';
import { ConversionContextStrip, useConversionRuntimeSnapshot } from './ConversionContextStrip';
import { ConversionCtaSelect } from './ConversionCtaSelect';
import { ConversionLeadForm } from './ConversionLeadForm';

/**
 * Commercial Conversion — journey conclusion (CSCB-07).
 * Presentation + mailto transport only. Section id preserved for nav continuity.
 */
export function AuditLeadCapture() {
  const snapshot = useConversionRuntimeSnapshot();
  const analytics = useOptionalDecisionAnalytics();
  const primaryCtaId =
    enabledCommercialCtas()[0]?.id ?? ('request-consultation' as CommercialCtaId);
  const [selectedCtaId, setSelectedCtaId] = useState<CommercialCtaId | null>(
    null,
  );

  const handleSelectCta = (id: CommercialCtaId) => {
    setSelectedCtaId(id);
    analytics?.conversionStarted(id);
  };

  return (
    <section
      aria-label="Commercial Conversion"
      id={PILOT_SECTION_IDS.audit}
      className="scroll-mt-header"
      data-testid="commercial-conversion"
    >
      <div
        className="overflow-hidden rounded-[11px] pb-8 shadow-[0_1px_11px_rgba(0,25,48,0.044)]"
        style={AUDIT_SECTION_STYLE}
      >
        <AuditTransition />

        <div className="flex flex-col gap-14 mobile:gap-11">
          <ConversionContextStrip />
          <ConversionCtaSelect
            selectedCtaId={selectedCtaId}
            primaryCtaId={primaryCtaId}
            onSelect={handleSelectCta}
          />
          {selectedCtaId !== null ? (
            <ConversionLeadForm ctaId={selectedCtaId} snapshot={snapshot} />
          ) : null}
        </div>

        <ContactCard />
      </div>
    </section>
  );
}
