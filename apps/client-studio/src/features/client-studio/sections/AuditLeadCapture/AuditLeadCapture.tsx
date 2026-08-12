import { useState } from "react";

import { JOURNEY_CTA_SECONDARY_CLASS } from "../../foundation/journeyCta";
import { scrollToSection } from "../../foundation/scrollToSection";
import { PILOT_SECTION_IDS } from "../../pilot/pilotVocabulary";
import {
  AssessmentWorkflow,
  AUDIT_ASSESSMENT_WORKFLOW_ID,
} from "./AssessmentWorkflow";
import { AuditContact } from "./AuditContact";
import { AuditTransition } from "./AuditTransition";
import { AUDIT_SECTION_STYLE, type LandOption } from "./audit-panel";
import { ContactCard } from "./ContactCard";
import { SituationSelect } from "./SituationSelect";

/**
 * Audit — Experience closer (CAP UX 42).
 * Freeze shell: land panels + workflow + simple form.
 * Not a second Priority. Not a second AI.
 */
export function AuditLeadCapture({ onBack }: { readonly onBack: () => void }) {
  const [landOption, setLandOption] = useState<LandOption>("owned");
  const handleLandOptionChange = (value: LandOption) => {
    setLandOption(value);
    scrollToSection(AUDIT_ASSESSMENT_WORKFLOW_ID);
  };

  return (
    <section
      aria-label="Audit — posouzení umístění domu"
      id={PILOT_SECTION_IDS.audit}
      className="scroll-mt-header"
      data-testid="audit-lead-capture"
    >
      <div
        className="overflow-hidden rounded-[11px] pb-8 shadow-[0_1px_11px_rgba(0,25,48,0.044)]"
        style={AUDIT_SECTION_STYLE}
      >
        <AuditTransition />

        <div className="flex flex-col gap-14 mobile:gap-11">
          <SituationSelect
            value={landOption}
            onChange={handleLandOptionChange}
          />
          <AssessmentWorkflow landOption={landOption} />
          <AuditContact />
        </div>

        <ContactCard />
      </div>

      <footer className="bg-[#F7F6F4]" data-testid="audit-final-footer">
        <div className="px-section pt-5">
          <button
            type="button"
            onClick={onBack}
            className={`${JOURNEY_CTA_SECONDARY_CLASS} justify-start mobile:w-full`}
            data-testid="audit-back"
          >
            ← Zpět
          </button>
        </div>
        <p className="py-section text-center text-xs font-bold text-embed-brand-navy">
          CONIS • Conversion Intelligence System – created by Radim Věntus ©
          2026
        </p>
      </footer>
    </section>
  );
}
