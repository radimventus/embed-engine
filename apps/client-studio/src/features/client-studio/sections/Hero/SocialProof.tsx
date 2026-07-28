import { colors } from '@embed-engine/design-tokens';
import { Panel } from '@embed-engine/ui';

import { useDecisionActivityFeed } from '../../decision-activity/useDecisionActivityFeed';
import { SocialProofIcon, type SocialProofIconName } from './SocialProofIcon';

const SOCIAL_PROOF_COLUMN_DIVIDER_STYLE = {
  backgroundColor: colors.action.accent,
} as const;

type SocialProofItemProps = {
  icon: SocialProofIconName;
  title: string;
  messages: readonly string[];
};

function SocialProofItem({ icon, title, messages }: SocialProofItemProps) {
  return (
    <div className="flex min-h-[128px] items-start px-section py-4">
      <div className="flex max-w-full items-start gap-3">
        <div className="pt-0.5">
          <SocialProofIcon name={icon} />
        </div>
        <div className="min-w-0">
          <p className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#001930]/65">
            {title}
          </p>
          <ul className="mt-2 m-0 list-none p-0">
            {messages.map((message) => (
              <li key={message} className="text-left text-sm leading-snug text-[#001930]">
                {message}
              </li>
            ))}
          </ul>
        </div>
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
        className="pointer-events-none absolute left-1/4 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden"
        style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2/4 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden"
        style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-3/4 top-[25%] z-10 h-1/2 w-px -translate-x-1/2 mobile:hidden"
        style={SOCIAL_PROOF_COLUMN_DIVIDER_STYLE}
      />
    </>
  );
}

export function SocialProof() {
  const activity = useDecisionActivityFeed();
  const popularity = activity.layers.find((layer) => layer.id === 'popularity');
  const behavior = activity.layers.find((layer) => layer.id === 'behavior');
  const preference = activity.layers.find((layer) => layer.id === 'preference');
  const live = activity.layers.find((layer) => layer.id === 'live');

  const cards = [
    {
      key: 'live',
      icon: 'viewing' as const,
      title: live?.title ?? 'Živá aktivita',
      messages:
        live?.items.map((item) => item.message) ?? ['1 zájemce právě prochází Decision Journey.'],
    },
    {
      key: 'popularity',
      icon: 'saved' as const,
      title: popularity?.title ?? 'Popularita',
      messages:
        popularity?.items.map((item) => item.message) ??
        ['Popularita se zobrazí po ověření dostatečného množství událostí.'],
    },
    {
      key: 'behavior',
      icon: 'inquiry' as const,
      title: behavior?.title ?? 'Chování návštěvníků',
      messages:
        behavior?.items.map((item) => item.message) ??
        ['Chování se zobrazí po ověření dostatečného množství událostí.'],
    },
    {
      key: 'preference',
      icon: 'inquiry' as const,
      title: preference?.title ?? 'Preference',
      messages:
        preference?.items.map((item) => item.message) ??
        ['Preference se zobrazí po získání dostatečných dat z Priority Experience.'],
    },
  ];

  return (
    <Panel
      as="section"
      id="social-proof"
      tabIndex={-1}
      aria-label="Social Proof"
      data-landing-anchor="social-proof"
      variant="elevated"
      className="relative grid scroll-mt-header grid-cols-4 !bg-[#FFFFFF] text-[#001930] mobile:grid-cols-1"
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
      {cards.map((card) => (
        <SocialProofItem
          key={card.key}
          icon={card.icon}
          title={card.title}
          messages={card.messages}
        />
      ))}
    </Panel>
  );
}
