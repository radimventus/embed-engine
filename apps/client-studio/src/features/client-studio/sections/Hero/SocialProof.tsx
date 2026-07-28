import { colors } from '@embed-engine/design-tokens';
import { useEffect, useMemo, useState } from 'react';
import { Panel } from '@embed-engine/ui';

import type { DecisionActivityItem } from '../../decision-activity/DecisionActivityEngine';
import { useDecisionActivityFeed } from '../../decision-activity/useDecisionActivityFeed';
import { SocialProofIcon, type SocialProofIconName } from './SocialProofIcon';

const SOCIAL_PROOF_DIVIDER_STYLE = {
  backgroundColor: colors.action.accent,
} as const;

const FEED_TICKER_PAUSE_MS = 4000;
const FEED_TICKER_SLIDE_MS = 2000;
const FEED_VISIBLE_ITEM_COUNT = 3;

type SocialProofEntry = {
  readonly id: string;
  icon: SocialProofIconName;
  label: string;
  message: string;
};

function SocialProofItem({ icon, label, message }: SocialProofEntry) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="shrink-0">
        <SocialProofIcon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#001930]/60">
          {label}
        </p>
        <p className="mt-1 text-sm leading-snug text-[#001930]">
          {message}
        </p>
      </div>
    </div>
  );
}

function activityFeedEntries(
  activity: ReturnType<typeof useDecisionActivityFeed>,
): readonly SocialProofEntry[] {
  const layerOrder = ['live', 'popularity', 'behavior', 'preference'] as const;
  const layerLabel = new Map(
    activity.layers.map((layer) => [layer.id, layer.title] as const),
  );
  const layerItems = new Map(
    activity.layers.map((layer) => [layer.id, [...layer.items] as DecisionActivityItem[]] as const),
  );

  const entries: SocialProofEntry[] = [];
  let appended = true;
  while (appended && entries.length < 8) {
    appended = false;
    for (const layerId of layerOrder) {
      const items = layerItems.get(layerId) ?? [];
      const next = items.shift();
      if (!next) {
        continue;
      }
      entries.push({
        id: next.id,
        icon:
          layerId === 'live'
            ? 'viewing'
            : layerId === 'popularity'
              ? 'saved'
              : 'inquiry',
        label: layerLabel.get(layerId) ?? layerId,
        message: next.message,
      });
      appended = true;
      layerItems.set(layerId, items);
    }
  }

  if (entries.length > 0) {
    return entries;
  }

  return [
    {
      id: 'bootstrap:live',
      icon: 'viewing',
      label: 'Živá aktivita',
      message: '1 zájemce právě prochází Decision Journey.',
    },
  ];
}

function visibleFeedWindow(
  entries: readonly SocialProofEntry[],
  startIndex: number,
  visibleCount: number,
): readonly SocialProofEntry[] {
  if (entries.length <= visibleCount) {
    return entries;
  }

  return Array.from({ length: visibleCount }, (_, offset) => {
    const index = (startIndex + offset) % entries.length;
    return entries[index]!;
  });
}

export function SocialProof() {
  const activity = useDecisionActivityFeed();
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const entries = useMemo(() => activityFeedEntries(activity), [activity]);
  const desktopEntries = useMemo(
    () =>
      visibleFeedWindow(
        entries,
        startIndex,
        Math.min(entries.length, FEED_VISIBLE_ITEM_COUNT + 1),
      ),
    [entries, startIndex],
  );
  const mobileEntries = useMemo(
    () => visibleFeedWindow(entries, startIndex, FEED_VISIBLE_ITEM_COUNT),
    [entries, startIndex],
  );

  useEffect(() => {
    setStartIndex(0);
    setIsAnimating(false);
  }, [entries]);

  useEffect(() => {
    if (entries.length <= FEED_VISIBLE_ITEM_COUNT) {
      return;
    }
    const startTimer = window.setTimeout(() => {
      setIsAnimating(true);
    }, FEED_TICKER_PAUSE_MS);
    const finishTimer = window.setTimeout(() => {
      setStartIndex((current) => (current + 1) % entries.length);
      setIsAnimating(false);
    }, FEED_TICKER_PAUSE_MS + FEED_TICKER_SLIDE_MS);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
    };
  }, [entries]);

  return (
    <Panel
      as="section"
      id="social-proof"
      tabIndex={-1}
      aria-label="Social Proof"
      data-landing-anchor="social-proof"
      variant="elevated"
      className="relative scroll-mt-header !bg-[#FFFFFF] text-[#001930]"
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
      <div className="hidden h-social-proof items-center overflow-hidden px-section desktop:flex">
        <div className="w-full overflow-hidden">
          <ul
            className="m-0 flex list-none p-0"
            style={{
              width: `${(desktopEntries.length / FEED_VISIBLE_ITEM_COUNT) * 100}%`,
              transform:
                desktopEntries.length > FEED_VISIBLE_ITEM_COUNT && isAnimating
                  ? `translateX(-${100 / desktopEntries.length}%)`
                  : 'translateX(0)',
              transition:
                desktopEntries.length > FEED_VISIBLE_ITEM_COUNT
                  ? `transform ${FEED_TICKER_SLIDE_MS}ms linear`
                  : 'none',
            }}
          >
            {desktopEntries.map((entry, index) => (
              <li
                key={entry.id}
                className="min-w-0"
                style={{ width: `${100 / desktopEntries.length}%` }}
              >
                <div className="flex items-center gap-4 pr-4">
                  <SocialProofItem {...entry} />
                  {index < desktopEntries.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className="h-10 w-px shrink-0"
                      style={SOCIAL_PROOF_DIVIDER_STYLE}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="desktop:hidden px-section py-3">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {mobileEntries.map((entry) => (
            <li key={entry.id}>
              <SocialProofItem {...entry} />
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
