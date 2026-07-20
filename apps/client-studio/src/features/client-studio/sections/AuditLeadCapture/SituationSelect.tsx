import { colors } from '@embed-engine/design-tokens';

import {
  AUDIT_ACCENT,
  AUDIT_MUTED,
  AUDIT_ON_ACCENT,
  AUDIT_PANEL_MAX_WIDTH_CLASS,
  AUDIT_WHITE,
  LAND_OPTIONS,
  type LandOption,
} from './audit-panel';
import { HouseIcon, SearchIcon } from './AuditIcons';

type SituationSelectProps = {
  value: LandOption;
  onChange: (value: LandOption) => void;
};

export function SituationSelect({ value, onChange }: SituationSelectProps) {
  return (
    <div className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} px-section`}>
      <h2 className="text-center text-base font-semibold tracking-wide">
        <span style={{ color: AUDIT_ACCENT }}>1. </span>
        <span style={{ color: AUDIT_WHITE }}>Vyberte, v jaké fázi se nacházíte</span>
      </h2>

      {/* Width 70% of content band (−30% narrowing). */}
      <div className="mx-auto mt-6 w-[70%] mobile:w-full">
        <div className="grid grid-cols-2 gap-5 mobile:grid-cols-1">
          {LAND_OPTIONS.map((option) => {
            const selected = option.value === value;
            const Icon = option.value === 'owned' ? HouseIcon : SearchIcon;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(option.value)}
                className="flex min-h-[128px] flex-col items-start gap-3 rounded-[8px] border px-6 py-[21px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930]"
                style={{
                  backgroundColor: selected ? AUDIT_ACCENT : colors.brand.navy,
                  borderColor: AUDIT_ACCENT,
                }}
              >
                <Icon
                  tone={selected ? 'onAccent' : 'gold'}
                  className="h-9 w-9"
                />
                <span
                  className="text-lg font-bold tracking-wide"
                  style={{ color: selected ? AUDIT_ON_ACCENT : AUDIT_ACCENT }}
                >
                  {option.label}
                </span>
                <span
                  className="text-sm leading-snug"
                  style={{ color: selected ? AUDIT_ON_ACCENT : AUDIT_MUTED }}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
