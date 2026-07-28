import { colors } from '@embed-engine/design-tokens';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '@embed-engine/ui';

import type { DecisionActivityItem } from '../../decision-activity/DecisionActivityEngine';
import { useDecisionActivityFeed } from '../../decision-activity/useDecisionActivityFeed';
import { SocialProofIcon, type SocialProofIconName } from './SocialProofIcon';

const SOCIAL_PROOF_DIVIDER_STYLE = {
  backgroundColor: colors.action.accent,
} as const;

const FEED_TICKER_PAUSE_MS = 8000;
const FEED_TICKER_SLIDE_MS = 400;
const FEED_VISIBLE_ITEM_COUNT = 3;
/** Same message must not reappear until at least five others were shown. */
const MIN_MESSAGES_BEFORE_REPEAT = 5;

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
  while (appended && entries.length < 24) {
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
  if (entries.length === 0) {
    return entries;
  }

  if (entries.length === 1) {
    return entries;
  }

  return Array.from({ length: visibleCount }, (_, offset) => {
    const index = (startIndex + offset) % entries.length;
    return entries[index]!;
  });
}

function nextStartIndex(
  current: number,
  entries: readonly SocialProofEntry[],
  recentMessages: readonly string[],
): number {
  if (entries.length <= 1) {
    return 0;
  }
  for (let step = 1; step <= entries.length; step += 1) {
    const candidate = (current + step) % entries.length;
    const message = entries[candidate]!.message;
    const lastIndex = recentMessages.lastIndexOf(message);
    if (
      lastIndex === -1 ||
      recentMessages.length - lastIndex - 1 >= MIN_MESSAGES_BEFORE_REPEAT
    ) {
      return candidate;
    }
  }
  return (current + 1) % entries.length;
}

export function SocialProof() {
  const activity = useDecisionActivityFeed();
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const recentMessagesRef = useRef<string[]>([]);
  const entries = useMemo(() => activityFeedEntries(activity), [activity]);
  const desktopEntries = useMemo(
    () => visibleFeedWindow(entries, startIndex, FEED_VISIBLE_ITEM_COUNT + 1),
    [entries, startIndex],
  );
  const mobileEntries = useMemo(
    () => visibleFeedWindow(entries, startIndex, FEED_VISIBLE_ITEM_COUNT),
    [entries, startIndex],
  );

  useEffect(() => {
    if (entries.length === 0) {
      setStartIndex(0);
      setIsAnimating(false);
      return;
    }
    setStartIndex((current) => current % entries.length);
  }, [entries.length]);

  useEffect(() => {
    if (entries.length <= 1) {
      return;
    }
    if (isAnimating) {
      return;
    }
    const startTimer = window.setTimeout(() => {
      setIsAnimating(true);
    }, FEED_TICKER_PAUSE_MS);
    return () => {
      window.clearTimeout(startTimer);
    };
  }, [entries, startIndex, isAnimating]);

  const handleTickerTransitionEnd = () => {
    if (!isAnimating || entries.length <= 1) {
      return;
    }
    setStartIndex((current) => {
      const next = nextStartIndex(current, entries, recentMessagesRef.current);
      const message = entries[next]?.message;
      if (message) {
        recentMessagesRef.current = [...recentMessagesRef.current, message].slice(
          -12,
        );
      }
      return next;
    });
    setIsAnimating(false);
  };

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
        <div className="relative w-full overflow-hidden">
          <ul
            className="m-0 flex list-none p-0"
            data-testid="social-proof-ticker-track"
            onTransitionEnd={handleTickerTransitionEnd}
            style={{
              width: `${(desktopEntries.length / FEED_VISIBLE_ITEM_COUNT) * 100}%`,
              transform:
                entries.length > 1 && isAnimating
                  ? `translateX(-${100 / desktopEntries.length}%)`
                  : 'translateX(0)',
              // Transition only while sliding left. Reset to 0 must be instant
              // or the browser animates back to the right.
              transition:
                entries.length > 1 && isAnimating
                  ? `transform ${FEED_TICKER_SLIDE_MS}ms linear`
                  : 'none',
            }}
          >
            {desktopEntries.map((entry) => (
              <li
                key={entry.id}
                className="relative min-w-0 shrink-0"
                style={{ width: `${100 / desktopEntries.length}%` }}
              >
                <div className="px-4">
                  <SocialProofItem {...entry} />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 w-px"
                  style={SOCIAL_PROOF_DIVIDER_STYLE}
                />
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
