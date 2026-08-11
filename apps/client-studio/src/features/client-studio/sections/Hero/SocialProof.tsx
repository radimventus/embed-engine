import { colors } from '@embed-engine/design-tokens';
import { getCanonicalProject } from '@embed-engine/platform-access';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '@embed-engine/ui';

import { useSocialProofReadModel } from '../../analytics/useSocialProofReadModel';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { SocialProofIcon, type SocialProofIconName } from './SocialProofIcon';

const FEED_TICKER_PAUSE_MS = 12000;
const FEED_TICKER_SLIDE_MS = 400;
const FEED_VISIBLE_ITEM_COUNT = 3;
const MIN_MESSAGES_BEFORE_REPEAT = 5;

type SocialProofEntry = {
  readonly id: string;
  readonly icon: SocialProofIconName;
  readonly value: string;
  readonly message: string;
};

function SocialProofItem({ icon, value, message }: SocialProofEntry) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <SocialProofIcon name={icon} />
      <div className="min-w-0">
        <p className="text-sm leading-snug text-[#001930]">
          <span className="mr-2 text-2xl font-bold tracking-tight">{value}</span>
          {message}
        </p>
      </div>
    </div>
  );
}

function readModelEntries(
  model: ReturnType<typeof useSocialProofReadModel>,
): readonly SocialProofEntry[] {
  if (model === null) return [];
  const { aggregate } = model;
  const recentEntries = model.recent.flatMap((item): readonly SocialProofEntry[] => {
    const houseName = getCanonicalProject(item.houseId)?.house?.name;
    if (houseName === undefined) return [];
    return [{
      id: `recent:${item.houseId}`,
      icon: 'viewing' as const,
      value: String(item.activeVisitors),
      message: item.locality === null
        ? `návštěvníci právě prohlížejí ${houseName}.`
        : `návštěvníci z oblasti ${item.locality} právě prohlížejí ${houseName}.`,
    }];
  });
  return [
    aggregate.savedByVisitors > 0
      ? { id: 'saved', icon: 'saved' as const, value: String(aggregate.savedByVisitors), message: 'návštěvníků si tento dům uložilo.' }
      : null,
    aggregate.returningVisitors > 0
      ? { id: 'returning', icon: 'viewing' as const, value: String(aggregate.returningVisitors), message: 'návštěvníků se k domu vrátilo.' }
      : null,
    aggregate.priorityPreferences[0]
      ? { id: `preference:${aggregate.priorityPreferences[0].priorityId}`, icon: 'inquiry' as const, value: `${aggregate.priorityPreferences[0].percentOfVisitors} %`, message: 'návštěvníků označilo tuto prioritu mezi důležitými.' }
      : null,
    ...recentEntries,
  ].filter((entry): entry is SocialProofEntry => entry !== null);
}

function nextStartIndex(
  current: number,
  entries: readonly SocialProofEntry[],
  recentMessages: readonly string[],
): number {
  for (let step = 1; step <= entries.length; step += 1) {
    const candidate = (current + step) % entries.length;
    const message = entries[candidate]!.message;
    const lastIndex = recentMessages.lastIndexOf(message);
    if (lastIndex === -1 || recentMessages.length - lastIndex - 1 >= MIN_MESSAGES_BEFORE_REPEAT) {
      return candidate;
    }
  }
  return (current + 1) % entries.length;
}

export function SocialProof() {
  const { analyticsScope } = useDecisionSessionRuntime();
  const readModel = useSocialProofReadModel(analyticsScope);
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const recentMessagesRef = useRef<string[]>([]);
  const entries = useMemo(() => readModelEntries(readModel), [readModel]);
  const visibleEntries = useMemo(
    () =>
      Array.from(
        { length: Math.min(FEED_VISIBLE_ITEM_COUNT + 1, entries.length) },
        (_, offset) => entries[(startIndex + offset) % entries.length]!,
      ),
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
    if (entries.length <= MIN_MESSAGES_BEFORE_REPEAT || isAnimating) {
      return;
    }
    const timer = window.setTimeout(() => setIsAnimating(true), FEED_TICKER_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [entries.length, isAnimating, startIndex]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Panel
      as="section"
      id="social-proof"
      tabIndex={-1}
      aria-label="Signály důvěry a rozhodování"
      data-landing-anchor="social-proof"
      variant="elevated"
      className="relative scroll-mt-header !bg-[#FFFFFF] text-[#001930]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-[2px] z-10 h-px" style={{ backgroundColor: colors.action.accent }} />
      <div className="hidden h-social-proof items-center overflow-hidden px-section desktop:flex">
        <ul
          className="m-0 flex list-none p-0"
          onTransitionEnd={() => {
            if (!isAnimating || entries.length <= MIN_MESSAGES_BEFORE_REPEAT) return;
            setStartIndex((current) => {
              const next = nextStartIndex(current, entries, recentMessagesRef.current);
              recentMessagesRef.current = [...recentMessagesRef.current, entries[next]!.message].slice(-12);
              return next;
            });
            setIsAnimating(false);
          }}
          style={{
            transform: isAnimating ? `translateX(-${100 / FEED_VISIBLE_ITEM_COUNT}%)` : 'translateX(0)',
            transition: isAnimating ? `transform ${FEED_TICKER_SLIDE_MS}ms linear` : 'none',
          }}
        >
          {visibleEntries.map((entry) => (
            <li key={entry.id} className="min-w-0 shrink-0 border-r border-[#D4AF37]/50 px-4 last:border-r-0" style={{ flexBasis: `${100 / FEED_VISIBLE_ITEM_COUNT}%` }}>
              <SocialProofItem {...entry} />
            </li>
          ))}
        </ul>
      </div>
      <div className="desktop:hidden px-section py-3">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {entries.slice(0, FEED_VISIBLE_ITEM_COUNT).map((entry) => (
            <li key={entry.id}><SocialProofItem {...entry} /></li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
