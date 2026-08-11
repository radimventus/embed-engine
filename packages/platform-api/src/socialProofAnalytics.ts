import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export type SocialProofEventKind =
  | 'experience.opened'
  | 'house.saved'
  | 'tour.completed'
  | 'priority.completed';

export type SocialProofAnalyticsEventInput = {
  /** Opaque, pseudonymous identifier. Never an email, name, IP address, or raw cookie. */
  readonly anonymousVisitorId: string;
  readonly sessionId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly occurredAt: string;
  readonly kind: SocialProofEventKind;
  readonly priorityIds?: readonly string[];
  /**
   * Optional coarse region (for example, a consented country-region code).
   * It is accepted only with explicit locality analytics consent.
   */
  readonly locality?: {
    readonly regionCode: string;
    readonly consented: true;
  };
};

export type SocialProofAggregate = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly from: string;
  readonly to: string;
  readonly uniqueVisitors: number;
  readonly visits: number;
  readonly returningVisitors: number;
  readonly savedByVisitors: number;
  readonly completedTours: number;
  readonly priorityPreferences: readonly {
    readonly priorityId: string;
    readonly visitorCount: number;
    readonly percentOfVisitors: number;
  }[];
};

export type RecentHouseActivity = {
  readonly houseId: string;
  readonly activeVisitors: number;
  readonly locality: string | null;
};

export interface SocialProofAnalyticsRepository {
  record(input: SocialProofAnalyticsEventInput): Promise<void>;
  aggregateHouse(input: {
    readonly companyId: string;
    readonly projectId: string;
    readonly houseId: string;
    readonly from: string;
    readonly to: string;
  }): Promise<SocialProofAggregate>;
  recentActivity(input: {
    readonly companyId: string;
    readonly projectId: string;
    readonly from: string;
    readonly to: string;
    readonly minimumVisitors: number;
  }): Promise<readonly RecentHouseActivity[]>;
}

type StoredEvent = Omit<
  SocialProofAnalyticsEventInput,
  'anonymousVisitorId' | 'sessionId' | 'locality'
> & {
  readonly visitorHash: string;
  readonly sessionHash: string;
  readonly locality: string | null;
};

type AnalyticsState = {
  readonly events: readonly StoredEvent[];
};

const MAX_EVENTS = 100_000;

function defaultStatePath(): string {
  return join(tmpdir(), 'embed-engine-platform-api', 'social-proof-events.json');
}

function isOpaqueId(value: string): boolean {
  return /^[A-Za-z0-9_-]{12,128}$/.test(value);
}

function isHouseId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9:_-]{1,127}$/.test(value);
}

function hashOpaqueId(value: string): string {
  return createHash('sha256').update(value).digest('base64url');
}

function isIsoTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function validatedEvent(input: SocialProofAnalyticsEventInput): StoredEvent {
  if (
    !isOpaqueId(input.anonymousVisitorId) ||
    !isOpaqueId(input.sessionId) ||
    !isHouseId(input.companyId) ||
    !isHouseId(input.projectId) ||
    !isHouseId(input.houseId) ||
    !isIsoTimestamp(input.occurredAt)
  ) {
    throw new Error('Invalid social proof analytics event.');
  }
  if (
    input.locality !== undefined &&
    (!input.locality.consented || !/^[A-Z]{2}(?:-[A-Z0-9]{1,3})?$/.test(input.locality.regionCode))
  ) {
    throw new Error('Invalid consented coarse locality.');
  }
  return {
    visitorHash: hashOpaqueId(input.anonymousVisitorId),
    sessionHash: hashOpaqueId(input.sessionId),
    companyId: input.companyId,
    projectId: input.projectId,
    houseId: input.houseId,
    occurredAt: new Date(input.occurredAt).toISOString(),
    kind: input.kind,
    priorityIds: input.priorityIds?.filter((id) => /^[a-z0-9-]{1,64}$/.test(id)),
    locality: input.locality?.regionCode ?? null,
  };
}

function inWindow(event: StoredEvent, from: string, to: string): boolean {
  const at = Date.parse(event.occurredAt);
  return at >= Date.parse(from) && at <= Date.parse(to);
}

function roundedPercent(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 10_000) / 100;
}

export class FileSocialProofAnalyticsRepository implements SocialProofAnalyticsRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(readonly statePath = defaultStatePath()) {}

  async record(input: SocialProofAnalyticsEventInput): Promise<void> {
    const event = validatedEvent(input);
    await this.mutate((state) => ({
      events: [...state.events, event].slice(-MAX_EVENTS),
    }));
  }

  async aggregateHouse(input: {
    readonly companyId: string;
    readonly projectId: string;
    readonly houseId: string;
    readonly from: string;
    readonly to: string;
  }): Promise<SocialProofAggregate> {
    const events = (await this.read()).events.filter(
      (event) =>
        event.companyId === input.companyId &&
        event.projectId === input.projectId &&
        event.houseId === input.houseId &&
        inWindow(event, input.from, input.to),
    );
    const visitors = new Set(events.map((event) => event.visitorHash));
    const sessionsByVisitor = new Map<string, Set<string>>();
    for (const event of events) {
      const sessions = sessionsByVisitor.get(event.visitorHash) ?? new Set<string>();
      sessions.add(event.sessionHash);
      sessionsByVisitor.set(event.visitorHash, sessions);
    }
    const preferenceVisitors = new Map<string, Set<string>>();
    for (const event of events.filter((item) => item.kind === 'priority.completed')) {
      for (const priorityId of event.priorityIds ?? []) {
        const selectedBy = preferenceVisitors.get(priorityId) ?? new Set<string>();
        selectedBy.add(event.visitorHash);
        preferenceVisitors.set(priorityId, selectedBy);
      }
    }
    return {
      companyId: input.companyId,
      projectId: input.projectId,
      houseId: input.houseId,
      from: input.from,
      to: input.to,
      uniqueVisitors: visitors.size,
      visits: new Set(events.map((event) => event.sessionHash)).size,
      returningVisitors: [...sessionsByVisitor.values()].filter((sessions) => sessions.size > 1).length,
      savedByVisitors: new Set(
        events.filter((event) => event.kind === 'house.saved').map((event) => event.visitorHash),
      ).size,
      completedTours: new Set(
        events.filter((event) => event.kind === 'tour.completed').map((event) => event.visitorHash),
      ).size,
      priorityPreferences: [...preferenceVisitors.entries()]
        .map(([priorityId, selectedBy]) => ({
          priorityId,
          visitorCount: selectedBy.size,
          percentOfVisitors: roundedPercent(selectedBy.size, visitors.size),
        }))
        .sort((left, right) => right.visitorCount - left.visitorCount || left.priorityId.localeCompare(right.priorityId)),
    };
  }

  async recentActivity(input: {
    readonly companyId: string;
    readonly projectId: string;
    readonly from: string;
    readonly to: string;
    readonly minimumVisitors: number;
  }): Promise<readonly RecentHouseActivity[]> {
    const grouped = new Map<string, StoredEvent[]>();
    for (const event of (await this.read()).events.filter(
      (item) =>
        item.companyId === input.companyId &&
        item.projectId === input.projectId &&
        inWindow(item, input.from, input.to),
    )) {
      grouped.set(event.houseId, [...(grouped.get(event.houseId) ?? []), event]);
    }
    return [...grouped.entries()]
      .map(([houseId, events]) => {
        const visitors = new Set(events.map((event) => event.visitorHash));
        const localities = new Set(events.map((event) => event.locality).filter((value): value is string => value !== null));
        return {
          houseId,
          activeVisitors: visitors.size,
          locality: localities.size === 1 ? [...localities][0]! : null,
        };
      })
      .filter((item) => item.activeVisitors >= Math.max(2, input.minimumVisitors))
      .sort((left, right) => right.activeVisitors - left.activeVisitors || left.houseId.localeCompare(right.houseId));
  }

  private async read(): Promise<AnalyticsState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as AnalyticsState;
      return Array.isArray(parsed.events) ? parsed : { events: [] };
    } catch {
      return { events: [] };
    }
  }

  private async mutate(update: (state: AnalyticsState) => AnalyticsState): Promise<void> {
    this.mutation = this.mutation.then(async () => {
      const next = update(await this.read());
      await mkdir(dirname(this.statePath), { recursive: true });
      const temporary = `${this.statePath}.tmp`;
      await writeFile(temporary, JSON.stringify(next), 'utf8');
      await rename(temporary, this.statePath);
    });
    return this.mutation;
  }
}
