import { colors } from '@embed-engine/design-tokens';

const HEADER_RULE_WIDTH_CLASS = 'w-[690px] max-w-full';

/** Chat column title — gold rule + white fade; dialogs scroll under the veil. */
export function SectionHeader() {
  return (
    <div className="relative z-20 bg-[#FFFFFF]">
      <h2 className="pb-section text-base font-bold tracking-wide text-embed-foreground-primary">
        AI PRŮVODCE — DOPLŇUJÍCÍ OTÁZKY
      </h2>
      <div
        aria-hidden="true"
        className={`h-px ${HEADER_RULE_WIDTH_CLASS}`}
        style={{ backgroundColor: colors.action.accent }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-full z-20 h-[60px] ${HEADER_RULE_WIDTH_CLASS}`}
        style={{
          backgroundImage: 'linear-gradient(to bottom, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
}
