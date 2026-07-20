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
          <p style={{ color: AUDIT_WHITE }}>+420 987 654 321</p>
          <p>kontakt@astav.cz</p>
        </div>
      </div>
    </div>
  );
}
