import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import {
  createCompositeExportAdapter,
  createConsoleExportAdapter,
  createMemoryExportAdapter,
} from './exportAdapter';
import {
  createDecisionAnalyticsCollector,
  type DecisionAnalyticsCollector,
} from './createCollector';

const DecisionAnalyticsContext =
  createContext<DecisionAnalyticsCollector | null>(null);

type DecisionAnalyticsProviderProps = {
  readonly children: ReactNode;
  /** Optional override for tests. */
  readonly collector?: DecisionAnalyticsCollector;
};

function createDefaultCollector(): DecisionAnalyticsCollector {
  const memory = createMemoryExportAdapter();
  const isBrowserDev =
    typeof window !== 'undefined' &&
    Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);
  const adapter = isBrowserDev
    ? createCompositeExportAdapter([memory, createConsoleExportAdapter()])
    : memory;

  return createDecisionAnalyticsCollector({
    sessionId: `analytics-${Date.now().toString(36)}`,
    adapter,
  });
}

/**
 * Passive Decision Analytics session for the Client Studio journey (CSCB-08).
 * Observes only — never dispatches Runtime commands.
 */
export function DecisionAnalyticsProvider({
  children,
  collector: injected,
}: DecisionAnalyticsProviderProps) {
  const collectorRef = useRef<DecisionAnalyticsCollector | null>(injected ?? null);
  if (collectorRef.current === null) {
    collectorRef.current = createDefaultCollector();
  }
  const collector = collectorRef.current;

  useEffect(() => {
    collector.startJourney();
    collector.experienceEvent({
      experienceEventType: 'experience.opened',
      surfaceId: 'hero',
    });

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        collector.abandonJourney();
      } else {
        collector.resumeJourney();
      }
    };
    const onPageHide = () => {
      collector.abandonJourney();
      collector.flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      collector.flush();
    };
  }, [collector]);

  const value = useMemo(() => collector, [collector]);

  return (
    <DecisionAnalyticsContext.Provider value={value}>
      {children}
    </DecisionAnalyticsContext.Provider>
  );
}

export function useDecisionAnalytics(): DecisionAnalyticsCollector {
  const context = useContext(DecisionAnalyticsContext);
  if (context === null) {
    throw new Error(
      'useDecisionAnalytics must be used within DecisionAnalyticsProvider',
    );
  }
  return context;
}

/** Optional hook for surfaces that may render outside analytics (tests). */
export function useOptionalDecisionAnalytics(): DecisionAnalyticsCollector | null {
  return useContext(DecisionAnalyticsContext);
}
