import { colors } from '@embed-engine/design-tokens';
import { Panel } from '@embed-engine/ui';

import { SocialProofIcon, type SocialProofIconName } from './SocialProofIcon';

const SOCIAL_PROOF_COLUMN_DIVIDER_STYLE = {
  backgroundColor: colors.action.accent,
} as const;

type SocialProofItemProps = {
  icon: SocialProofIconName;
  value: string;
  label: string;
};

function SocialProofItem({ icon, value, label }: SocialProofItemProps) {
  return (
    <div className="flex h-social-proof items-center justify-center px-section">
      <div className="flex max-w-full items-center gap-3">
        <SocialProofIcon name={icon} />
        <p className="text-left text-sm leading-snug text-[#001930]">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          <span className="ml-2 text-[#001930]/70">{label}</span>
        </p>
      </div>
    </div>
  );
}

/** Gold column rules — inset 25% from top and bottom of the block. */
function SocialProofColumnDividers() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden"
        style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2/3 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden"
        style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
      />
    </>
  );
}

export function SocialProof() {
  return (
    <Panel
      as="section"
      id="social-proof"
      tabIndex={-1}
      aria-label="Social Proof"
      data-landing-anchor="social-proof"
      variant="elevated"
      className="relative grid scroll-mt-header grid-cols-3 !bg-[#FFFFFF] text-[#001930] mobile:grid-cols-1"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-white"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[2px] z-10 h-px"
        style={{ backgroundColor: colors.action.accent }}
      />
      <SocialProofColumnDividers />
      <SocialProofItem icon="viewing" value="1" label="rodina si právě prohlíží tento dům" />
      <SocialProofItem
        icon="saved"
        value="18"
        label="zájemců si uložilo tento dům v minulém měsíci"
      />
      <SocialProofItem
        icon="inquiry"
        value="21 %"
        label="zájemců se dotazuje na velikost pozemku"
      />
    </Panel>
  );
}
