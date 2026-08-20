import { AUDIT_ACCENT, AUDIT_MUTED, AUDIT_WHITE } from './audit-panel';

export function SuccessState() {
  return (
    <div
      className="rounded-[8px] border px-6 py-8 text-center"
      style={{ borderColor: `${AUDIT_ACCENT}66` }}
      data-testid="lead-capture-success"
    >
      <p className="text-xl font-semibold" style={{ color: AUDIT_WHITE }}>
        Poptávka byla přijata.
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: AUDIT_MUTED }}>
        Vaše údaje jsme bezpečně uložili. Partner vás bude kontaktovat s dalším
        postupem.
      </p>
    </div>
  );
}
