import type { AnalyticsEvent } from '../analytics';

export type DecisionActivityLayerId =
  | 'popularity'
  | 'behavior'
  | 'preference'
  | 'live';

export type DecisionActivityItem = {
  readonly id: string;
  readonly layerId: DecisionActivityLayerId;
  readonly message: string;
  readonly sourceEventTypes: readonly string[];
};

export type DecisionActivityLayer = {
  readonly id: DecisionActivityLayerId;
  readonly title: string;
  readonly items: readonly DecisionActivityItem[];
  readonly active: boolean;
};

export type DecisionActivitySnapshot = {
  readonly bootstrapMode: boolean;
  readonly layers: readonly DecisionActivityLayer[];
};

const MIN_POPULARITY_EVENTS = 3;
const MIN_BEHAVIOR_EVENTS = 3;
const MIN_PREFERENCE_SESSIONS = 3;

const PRIORITY_LABELS: Readonly<Record<string, string>> = Object.freeze({
  plot: 'pozemek',
  layout: 'dispozici domu',
  privacy: 'soukromí',
  energy: 'energetickou úspornost',
  'operating-costs': 'provozní náklady',
  design: 'design',
  quality: 'kvalitu',
  investment: 'investici',
  maintenance: 'údržbu',
  flexibility: 'flexibilitu',
});

type PriorityCompletedEvent = Extract<
  AnalyticsEvent,
  { readonly type: 'experience.event' }
> & {
  readonly experienceEventType: 'priority.completed';
};

export function projectDecisionActivity(
  events: readonly AnalyticsEvent[],
): DecisionActivitySnapshot {
  const popularity = projectPopularityLayer(events);
  const behavior = projectBehaviorLayer(events);
  const preference = projectPreferenceLayer(events);
  const live = projectLiveLayer(events);

  const layers: readonly DecisionActivityLayer[] = [
    createLayer('popularity', 'Popularita', popularity),
    createLayer('behavior', 'Chování návštěvníků', behavior),
    createLayer('preference', 'Preference', preference),
    createLayer('live', 'Živá aktivita', live),
  ];

  return Object.freeze({
    bootstrapMode:
      popularity.length === 0 && behavior.length === 0 && preference.length === 0,
    layers,
  });
}

function createLayer(
  id: DecisionActivityLayerId,
  title: string,
  items: readonly DecisionActivityItem[],
): DecisionActivityLayer {
  return Object.freeze({
    id,
    title,
    items,
    active: items.length > 0,
  });
}

function projectPopularityLayer(
  events: readonly AnalyticsEvent[],
): readonly DecisionActivityItem[] {
  const savedCount = countExperienceEvents(events, 'house.saved');
  const heroVideoOpenedCount = countExperienceEvents(events, 'hero.video.opened');
  const tourCompletedCount =
    countExperienceEvents(events, 'tour.completed') +
    countSurfaceCompletions(events, 'walkthrough');

  const items: DecisionActivityItem[] = [];
  if (savedCount >= MIN_POPULARITY_EVENTS) {
    items.push({
      id: 'popularity:saved',
      layerId: 'popularity',
      message: `${savedCount} zájemců si přidalo tento dům mezi oblíbené.`,
      sourceEventTypes: ['experience.event'],
    });
  }
  if (heroVideoOpenedCount >= MIN_POPULARITY_EVENTS) {
    items.push({
      id: 'popularity:hero-video',
      layerId: 'popularity',
      message: `${heroVideoOpenedCount} zájemců si přehrálo úvodní video.`,
      sourceEventTypes: ['experience.event'],
    });
  }
  if (tourCompletedCount >= MIN_POPULARITY_EVENTS) {
    items.push({
      id: 'popularity:tour-completed',
      layerId: 'popularity',
      message: `${tourCompletedCount} zájemců dokončilo virtuální prohlídku.`,
      sourceEventTypes: ['experience.event', 'surface.exited'],
    });
  }
  return items;
}

function projectBehaviorLayer(
  events: readonly AnalyticsEvent[],
): readonly DecisionActivityItem[] {
  const bySession = new Map<string, readonly AnalyticsEvent[]>();
  for (const event of events) {
    const sessionEvents = bySession.get(event.sessionId) ?? [];
    bySession.set(event.sessionId, [...sessionEvents, event]);
  }

  const floorplanFirst = countFirstAction(bySession, 'floorplan.opened');
  const roomFirst = countFirstRoomSelection(bySession);
  const totalSessions = bySession.size;

  const items: DecisionActivityItem[] = [];
  if (totalSessions >= MIN_BEHAVIOR_EVENTS && floorplanFirst.count > 0) {
    items.push({
      id: 'behavior:floorplan-first',
      layerId: 'behavior',
      message: `${percent(floorplanFirst.count, totalSessions)} % zájemců si nejprve otevře půdorys.`,
      sourceEventTypes: ['experience.event'],
    });
  }
  if (totalSessions >= MIN_BEHAVIOR_EVENTS && roomFirst.count > 0) {
    items.push({
      id: 'behavior:first-room',
      layerId: 'behavior',
      message: `${percent(roomFirst.count, totalSessions)} % zájemců začne prohlídku v ${roomFirst.label}.`,
      sourceEventTypes: ['runtime.signal'],
    });
  }
  return items;
}

function projectPreferenceLayer(
  events: readonly AnalyticsEvent[],
): readonly DecisionActivityItem[] {
  const completedSelections = events.filter(isPriorityCompletedEvent);
  const sessionCount = new Set(completedSelections.map((event) => event.sessionId)).size;
  if (sessionCount < MIN_PREFERENCE_SESSIONS) {
    return [];
  }

  const counts = new Map<string, number>();
  for (const event of completedSelections) {
    const ids = String(event.payload.priorityIds ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    for (const id of ids) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([priorityId, count]) =>
      Object.freeze({
        id: `preference:${priorityId}`,
        layerId: 'preference' as const,
        message: `${percent(count, sessionCount)} % zájemců označuje ${PRIORITY_LABELS[priorityId] ?? priorityId} jako hlavní prioritu.`,
        sourceEventTypes: ['experience.event'],
      }),
    );
}

function isPriorityCompletedEvent(
  event: AnalyticsEvent,
): event is PriorityCompletedEvent {
  return (
    event.type === 'experience.event' &&
    event.experienceEventType === 'priority.completed'
  );
}

function projectLiveLayer(
  events: readonly AnalyticsEvent[],
): readonly DecisionActivityItem[] {
  return events
    .slice()
    .reverse()
    .map(projectLiveItem)
    .filter((item): item is DecisionActivityItem => item !== null)
    .slice(0, 4);
}

function projectLiveItem(event: AnalyticsEvent): DecisionActivityItem | null {
  if (event.type === 'experience.event') {
    switch (event.experienceEventType) {
      case 'hero.video.opened':
        return liveItem('hero-video-opened', '1 zájemce právě přehrává úvodní video.');
      case 'house.saved':
        return liveItem('house-saved', '1 zájemce si právě ukládá tento dům.');
      case 'tour.started':
        return liveItem('tour-started', '1 zájemce právě zahájil prohlídku Client Studia.');
      case 'tour.completed':
        return liveItem('tour-completed', '1 zájemce právě dokončil úvodní prohlídku.');
      case 'floorplan.opened':
        return liveItem('floorplan-opened', '1 zájemce právě otevřel půdorys.');
      case 'floorplan.zoomed':
        return liveItem('floorplan-zoomed', '1 zájemce právě zvětšil půdorys.');
      case 'floor.changed':
        return liveItem('floor-changed', '1 zájemce právě změnil podlaží.');
      case 'specification.viewed':
        return liveItem('specification-viewed', '1 zájemce právě otevřel technické parametry domu.');
      case 'energy.viewed':
        return liveItem('energy-viewed', '1 zájemce právě porovnává energetické parametry domu.');
      case 'construction.viewed':
        return liveItem('construction-viewed', '1 zájemce právě porovnává konstrukční řešení domu.');
      case 'financing.viewed':
        return liveItem('financing-viewed', '1 zájemce právě porovnává provozní náklady.');
      case 'priority.selected':
      case 'priority.changed':
        return liveItem('priority-changed', '1 zájemce právě vybírá své priority.');
      case 'priority.completed':
        return liveItem('priority-completed', '1 zájemce právě dokončil nastavení priorit.');
      case 'ai.conversation.started':
        return liveItem('ai-started', '1 zájemce právě konzultuje dům s AI poradcem.');
      case 'ai.conversation.completed':
        return liveItem('ai-completed', '1 zájemce právě dokončil konzultaci s AI poradcem.');
      case 'contact.opened':
        return liveItem('contact-opened', '1 zájemce právě požádal o konzultaci.');
      case 'contact.submitted':
        return liveItem('contact-submitted', '1 zájemce právě odeslal kontaktní formulář.');
      default:
        return null;
    }
  }

  if (event.type === 'runtime.signal') {
    if (event.runtimeEventType === 'RoomSelected') {
      return liveItem(
        `room-selected:${String(event.payload.roomId ?? 'room')}`,
        `1 zájemce právě otevřel ${formatRoomLabel(String(event.payload.roomId ?? 'místnost'))}.`,
      );
    }
    if (event.runtimeEventType === 'PriorityChanged') {
      const priorityCount = Number(event.payload.priorityCount ?? 0);
      return priorityCount >= 3
        ? liveItem('priority-runtime-complete', '1 zájemce právě dokončil nastavení priorit.')
        : liveItem('priority-runtime-changed', '1 zájemce právě vybírá své priority.');
    }
  }

  if (event.type === 'ai.session.opened') {
    return liveItem('ai-session-opened', '1 zájemce právě konzultuje dům s AI poradcem.');
  }
  if (event.type === 'ai.session.ended') {
    return liveItem('ai-session-ended', '1 zájemce právě dokončil konzultaci s AI poradcem.');
  }
  if (event.type === 'conversion.started') {
    return liveItem('conversion-started', '1 zájemce právě požádal o konzultaci.');
  }
  if (event.type === 'conversion.completed') {
    return liveItem('conversion-completed', '1 zájemce právě odeslal kontaktní formulář.');
  }
  if (event.type === 'surface.entered' && event.surfaceId === 'walkthrough') {
    return liveItem('surface-tour-started', '1 zájemce právě zahájil prohlídku Client Studia.');
  }
  if (event.type === 'surface.exited' && event.surfaceId === 'walkthrough') {
    return liveItem('surface-tour-completed', '1 zájemce právě dokončil úvodní prohlídku.');
  }
  return null;
}

function liveItem(id: string, message: string): DecisionActivityItem {
  return Object.freeze({
    id: `live:${id}`,
    layerId: 'live',
    message,
    sourceEventTypes: [],
  });
}

function countExperienceEvents(
  events: readonly AnalyticsEvent[],
  experienceEventType: string,
): number {
  return events.filter(
    (event) =>
      event.type === 'experience.event' &&
      event.experienceEventType === experienceEventType,
  ).length;
}

function countSurfaceCompletions(
  events: readonly AnalyticsEvent[],
  surfaceId: string,
): number {
  return events.filter(
    (event) => event.type === 'surface.exited' && event.surfaceId === surfaceId,
  ).length;
}

function countFirstAction(
  sessions: ReadonlyMap<string, readonly AnalyticsEvent[]>,
  experienceEventType: string,
): { readonly count: number } {
  let count = 0;
  for (const sessionEvents of sessions.values()) {
    const ordered = [...sessionEvents].sort((left, right) => left.at - right.at);
    const first = ordered.find((event) => event.type === 'experience.event');
    if (
      first?.type === 'experience.event' &&
      first.experienceEventType === experienceEventType
    ) {
      count += 1;
    }
  }
  return { count };
}

function countFirstRoomSelection(
  sessions: ReadonlyMap<string, readonly AnalyticsEvent[]>,
): { readonly count: number; readonly label: string } {
  const counts = new Map<string, number>();
  for (const sessionEvents of sessions.values()) {
    const ordered = [...sessionEvents].sort((left, right) => left.at - right.at);
    const roomSelected = ordered.find(
      (event) =>
        event.type === 'runtime.signal' &&
        event.runtimeEventType === 'RoomSelected' &&
        typeof event.payload.roomId === 'string',
    );
    if (roomSelected?.type === 'runtime.signal' && typeof roomSelected.payload.roomId === 'string') {
      const key = roomSelected.payload.roomId;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const [roomId = 'obývacím pokoji', count = 0] =
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];
  return { count, label: formatRoomLabel(roomId, true) };
}

function formatRoomLabel(roomId: string, locative = false): string {
  const normalized = roomId.replace(/[-_]+/g, ' ').trim();
  if (normalized === 'living room' || normalized === 'living') {
    return locative ? 'obývacím pokoji' : 'obývací pokoj';
  }
  if (normalized === 'kitchen') {
    return locative ? 'kuchyni' : 'kuchyň';
  }
  if (normalized === 'bedroom') {
    return locative ? 'ložnici' : 'ložnice';
  }
  return normalized;
}

function percent(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((count / total) * 100);
}
