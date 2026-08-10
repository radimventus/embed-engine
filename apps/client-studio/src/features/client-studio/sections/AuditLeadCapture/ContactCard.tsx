import {
  EXPERIENCE_CONTACT_EMAIL,
} from '../../header/experienceContact';
import { AUDIT_ACCENT, AUDIT_MUTED, AUDIT_PANEL_MAX_WIDTH_CLASS, AUDIT_WHITE } from './audit-panel';

/** Contact fallback for visitors who prefer not to use the form. */
export function ContactCard() {
  return (
    <div
      className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} mt-10 border-t px-section pt-6 mobile:mt-8`}
      style={{ borderColor: `${AUDIT_ACCENT}55` }}
    >
      <div className="text-center text-sm leading-relaxed">
        <p style={{ color: AUDIT_WHITE }}>Potřebujete se nejdřív zeptat?</p>
        <a
          href={`mailto:${EXPERIENCE_CONTACT_EMAIL}`}
          className="underline underline-offset-2"
          style={{ color: AUDIT_MUTED }}
        >
          {EXPERIENCE_CONTACT_EMAIL}
        </a>
      </div>
    </div>
  );
}
