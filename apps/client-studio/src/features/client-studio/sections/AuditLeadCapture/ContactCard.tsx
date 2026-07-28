import {
  EXPERIENCE_CONTACT_EMAIL,
  EXPERIENCE_CONTACT_PHONE_DISPLAY,
} from '../../header/experienceContact';
import { AUDIT_ACCENT, AUDIT_MUTED, AUDIT_PANEL_MAX_WIDTH_CLASS, AUDIT_WHITE } from './audit-panel';

/** Company contact strip — approved Audit footer. */
export function ContactCard() {
  return (
    <div
      className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} mt-10 border-t px-section pt-6 mobile:mt-8`}
      style={{ borderColor: `${AUDIT_ACCENT}55` }}
    >
      <div className="grid grid-cols-2 gap-section text-sm leading-relaxed mobile:grid-cols-1 mobile:text-center">
        <div style={{ color: AUDIT_MUTED }}>
          <p style={{ color: AUDIT_WHITE }}>Asrav s.r.o.</p>
          <p>Budějická 765, Lierec</p>
          <p>IČ: 123 456 88</p>
        </div>
        <div className="text-right mobile:text-center" style={{ color: AUDIT_MUTED }}>
          <p style={{ color: AUDIT_WHITE }}>{EXPERIENCE_CONTACT_PHONE_DISPLAY}</p>
          <p>{EXPERIENCE_CONTACT_EMAIL}</p>
        </div>
      </div>
    </div>
  );
}
