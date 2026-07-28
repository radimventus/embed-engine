import { useEffect, useMemo, useState } from 'react';

import { useOptionalDecisionAnalytics } from '../analytics';
import {
  projectDecisionActivity,
  type DecisionActivitySnapshot,
} from './DecisionActivityEngine';

function emptySnapshot(): DecisionActivitySnapshot {
  return projectDecisionActivity([]);
}

/**
 * UI adapter only — the engine interprets events, this hook just subscribes to updates.
 */
export function useDecisionActivityFeed(): DecisionActivitySnapshot {
  const analytics = useOptionalDecisionAnalytics();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (analytics === null) {
      return;
    }
    return analytics.subscribe(() => {
      setRevision((value) => value + 1);
    });
  }, [analytics]);

  return useMemo(() => {
    if (analytics === null) {
      return emptySnapshot();
    }
    void revision;
    return projectDecisionActivity(analytics.getEvents());
  }, [analytics, revision]);
}
