import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { platformApiStatePath } from './platformApiConfig';
import {
  isDecisionSessionId,
  sanitizeSerializedDecisionSession,
  type DurableDecisionSessionInput,
  type DurableDecisionSessionRecord,
} from './decisionSessionRecord';

export type DecisionSessionScopeQuery = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId?: string;
};

export class DecisionSessionScopeMismatchError extends Error {
  constructor() {
    super('Decision session scope mismatch.');
  }
}

export interface DecisionSessionRepository {
  upsert(input: DurableDecisionSessionInput): Promise<DurableDecisionSessionRecord>;
  getById(decisionSessionId: string): Promise<DurableDecisionSessionRecord | null>;
  getByScopeAndId(input: {
    readonly companyId: string;
    readonly projectId: string;
    readonly houseId: string;
    readonly decisionSessionId: string;
  }): Promise<DurableDecisionSessionRecord | null>;
  list(query: DecisionSessionScopeQuery): Promise<readonly DurableDecisionSessionRecord[]>;
}

type SessionState = {
  readonly sessions: readonly DurableDecisionSessionRecord[];
};

function sameScope(
  record: DurableDecisionSessionRecord,
  companyId: string,
  projectId: string,
  houseId: string,
): boolean {
  return (
    record.companyId === companyId &&
    record.projectId === projectId &&
    record.houseId === houseId
  );
}

export class FileDecisionSessionRepository implements DecisionSessionRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly statePath = platformApiStatePath('decision-sessions.json'),
  ) {}

  async upsert(
    input: DurableDecisionSessionInput,
  ): Promise<DurableDecisionSessionRecord> {
    const decisionSessionId = input.decisionSessionId.trim();
    const companyId = input.companyId.trim();
    const projectId = input.projectId.trim();
    const houseId = input.houseId.trim();
    if (
      !isDecisionSessionId(decisionSessionId) ||
      companyId.length === 0 ||
      projectId.length === 0 ||
      houseId.length === 0
    ) {
      throw new Error('Invalid decision session identity.');
    }
    const serialized = sanitizeSerializedDecisionSession(input.serialized, houseId);
    const now = new Date().toISOString();

    return this.exclusively(async () => {
      const state = await this.read();
      const existing = state.sessions.find(
        (item) => item.decisionSessionId === decisionSessionId,
      );
      if (existing && !sameScope(existing, companyId, projectId, houseId)) {
        throw new DecisionSessionScopeMismatchError();
      }
      const next: DurableDecisionSessionRecord = {
        decisionSessionId,
        companyId,
        projectId,
        houseId,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        serialized,
      };
      const sessions = existing
        ? state.sessions.map((item) =>
            item.decisionSessionId === decisionSessionId ? next : item,
          )
        : [...state.sessions, next];
      await this.write({ sessions });
      return next;
    });
  }

  async getById(
    decisionSessionId: string,
  ): Promise<DurableDecisionSessionRecord | null> {
    const id = decisionSessionId.trim();
    if (!isDecisionSessionId(id)) {
      return null;
    }
    return (
      (await this.read()).sessions.find((item) => item.decisionSessionId === id) ??
      null
    );
  }

  async getByScopeAndId(input: {
    readonly companyId: string;
    readonly projectId: string;
    readonly houseId: string;
    readonly decisionSessionId: string;
  }): Promise<DurableDecisionSessionRecord | null> {
    const record = await this.getById(input.decisionSessionId);
    if (record === null) {
      return null;
    }
    return sameScope(
      record,
      input.companyId.trim(),
      input.projectId.trim(),
      input.houseId.trim(),
    )
      ? record
      : null;
  }

  async list(
    query: DecisionSessionScopeQuery,
  ): Promise<readonly DurableDecisionSessionRecord[]> {
    const companyId = query.companyId.trim();
    const projectId = query.projectId.trim();
    const houseId = query.houseId?.trim() ?? '';
    if (companyId.length === 0 || projectId.length === 0) {
      return [];
    }
    return (await this.read()).sessions.filter(
      (item) =>
        item.companyId === companyId &&
        item.projectId === projectId &&
        (houseId.length === 0 || item.houseId === houseId),
    );
  }

  private async read(): Promise<SessionState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as SessionState;
      return {
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { sessions: [] };
      }
      throw error;
    }
  }

  private async write(state: SessionState): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });
    const temporary = `${this.statePath}.tmp`;
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, this.statePath);
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
