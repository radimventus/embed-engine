import type { CommercialCta, CommercialCtaId } from '../../pilot/commercialConversion';
import { enabledCommercialCtas } from '../../pilot/commercialConversion';
import {
  AUDIT_ACCENT,
  AUDIT_MUTED,
  AUDIT_PANEL_MAX_WIDTH_CLASS,
  AUDIT_WHITE,
} from './audit-panel';

type ConversionCtaSelectProps = {
  readonly selectedCtaId: CommercialCtaId | null;
  readonly onSelect: (id: CommercialCtaId) => void;
  readonly primaryCtaId: CommercialCtaId;
};

/**
 * Configurable commercial CTAs (CSCB-07). Presentation only.
 */
export function ConversionCtaSelect({
  selectedCtaId,
  onSelect,
  primaryCtaId,
}: ConversionCtaSelectProps) {
  const ordered = orderCtas(enabledCommercialCtas(), primaryCtaId);

  return (
    <div
      className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} px-section`}
      data-testid="conversion-cta-select"
    >
      <h2 className="text-center text-base font-semibold tracking-wide">
        <span style={{ color: AUDIT_ACCENT }}>1. </span>
        <span style={{ color: AUDIT_WHITE }}>Jak chcete pokračovat?</span>
      </h2>
      <p
        className="mx-auto mt-3 max-w-xl text-center text-sm leading-snug"
        style={{ color: AUDIT_MUTED }}
      >
        Vyberte akci. Formulář se zobrazí až poté — bez přerušení vašeho rozhodování.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 mobile:grid-cols-1">
        {ordered.map((cta) => {
          const selected = cta.id === selectedCtaId;
          const primary = cta.id === primaryCtaId;
          return (
            <li key={cta.id}>
              <button
                type="button"
                data-cta-id={cta.id}
                data-primary={primary ? 'true' : 'false'}
                aria-pressed={selected}
                className="flex h-full w-full flex-col rounded-[8px] border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35"
                style={{
                  borderColor: selected ? AUDIT_ACCENT : `${AUDIT_MUTED}66`,
                  backgroundColor: selected ? `${AUDIT_ACCENT}22` : 'transparent',
                }}
                onClick={() => onSelect(cta.id)}
              >
                {primary ? (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: AUDIT_ACCENT }}
                  >
                    Doporučený další krok
                  </span>
                ) : null}
                <span
                  className="mt-1 text-sm font-semibold"
                  style={{ color: selected ? AUDIT_ACCENT : AUDIT_WHITE }}
                >
                  {cta.labelCs}
                </span>
                <span className="mt-1 text-xs leading-snug" style={{ color: AUDIT_MUTED }}>
                  {cta.descriptionCs}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function orderCtas(
  ctas: readonly CommercialCta[],
  primaryCtaId: CommercialCtaId,
): readonly CommercialCta[] {
  const primary = ctas.find((cta) => cta.id === primaryCtaId);
  if (primary === undefined) {
    return ctas;
  }
  return [primary, ...ctas.filter((cta) => cta.id !== primaryCtaId)];
}
