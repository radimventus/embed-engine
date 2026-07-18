import { useState } from 'react';

import { AssessmentWorkflow } from './AssessmentWorkflow';
import { AuditContact } from './AuditContact';
import { AuditTransition } from './AuditTransition';
import { AUDIT_SECTION_STYLE, type LandOption } from './audit-panel';
import { ContactCard } from './ContactCard';
import { SituationSelect } from './SituationSelect';

export function AuditLeadCapture() {
  const [landOption, setLandOption] = useState<LandOption>('owned');

  return (
    <section aria-label="Audit — posouzení umístění domu">
      <div
        className="overflow-hidden rounded-[11px] pb-8 shadow-[0_1px_11px_rgba(0,25,48,0.044)]"
        style={AUDIT_SECTION_STYLE}
      >
        <AuditTransition />

        <div className="flex flex-col gap-14 mobile:gap-11">
          <SituationSelect value={landOption} onChange={setLandOption} />
          <AssessmentWorkflow landOption={landOption} />
          <AuditContact />
        </div>

        <ContactCard />
      </div>

      <p className="bg-[#F7F6F4] py-section text-center text-xs font-bold text-embed-brand-navy">
        Client studio – created by Radim Věntus © 2026.
      </p>
    </section>
  );
}
