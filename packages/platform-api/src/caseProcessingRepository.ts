import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { platformApiStatePath } from './platformApiConfig';

export type CaseProcessingStatus = 'new' | 'accepted';

export type CaseProcessingRecord = {
  readonly caseId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly processingStatus: CaseProcessingStatus;
};

export type CaseProcessingScopeQuery = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId?: string;
};

export type CaseProcessingAcceptInput = {
  readonly caseId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
};

export interface CaseProcessingRepository {
  list(query: CaseProcessingScopeQuery): Promise<readonly CaseProcessingRecord[]>;
  accept(input: CaseProcessingAcceptInput): Promise<CaseProcessingRecord>;
}

export class CaseProcessingNotFoundError extends Error {
  constructor() {
    super('Operational case not found.');
  }
}

type CaseProcessingState = {
  readonly cases: readonly CaseProcessingRecord[];
};

export function isReferenceOperationalCaseId(
  caseId: string,
  companyId: string,
  projectId: string,
  houseId: string,
): boolean {
  const prefix = `ref:${companyId}:${projectId}:${houseId}:`;
  return caseId.startsWith(prefix) && caseId.length > prefix.length;
}

type CaseProcessingStateFile = {
  readonly cases?: readonly Partial<CaseProcessingRecord>[];
};

export class FileCaseProcessingRepository implements CaseProcessingRepository {
  private mutation: Promise<void> = Promise.resolve();
  constructor(
    private readonly statePath = platformApiStatePath('case-processing.json'),
  ) {}

  async list(
    query: CaseProcessingScopeQuery,
  ): Promise<readonly CaseProcessingRecord[]> {
    const companyId = query.companyId.trim();
    const projectId = query.projectId.trim();
    const houseId = query.houseId?.trim() ?? '';
    if (companyId.length === 0 || projectId.length === 0) {
      return [];
    }
    return (await this.read()).cases.filter(
      (item) =>
        item.companyId === companyId &&
        item.projectId === projectId &&
        (houseId.length === 0 || item.houseId === houseId),
    );
  }

  async accept(
    input: CaseProcessingAcceptInput,
  ): Promise<CaseProcessingRecord> {
    const caseId = input.caseId.trim();
    const companyId = input.companyId.trim();
    const projectId = input.projectId.trim();
    const houseId = input.houseId.trim();
    if (
      !isReferenceOperationalCaseId(caseId, companyId, projectId, houseId)
    ) {
      throw new CaseProcessingNotFoundError();
    }
    return this.exclusively(async () => {
      const state = await this.read();
      const index = state.cases.findIndex(
        (item) =>
          item.caseId === caseId &&
          item.companyId === companyId &&
          item.projectId === projectId &&
          item.houseId === houseId,
      );
      if (index >= 0) {
        const existing = state.cases[index]!;
        if (existing.processingStatus === 'accepted') {
          return existing;
        }
        const accepted: CaseProcessingRecord = {
          ...existing,
          processingStatus: 'accepted',
        };
        const cases = [...state.cases];
        cases[index] = accepted;
        await this.write({ cases });
        return accepted;
      }
      const created: CaseProcessingRecord = {
        caseId,
        companyId,
        projectId,
        houseId,
        processingStatus: 'accepted',
      };
      await this.write({ cases: [...state.cases, created] });
      return created;
    });
  }

  private async read(): Promise<CaseProcessingState> {
    try {
      const parsed = JSON.parse(
        await readFile(this.statePath, 'utf8'),
      ) as CaseProcessingStateFile;
      return {
        cases: Array.isArray(parsed.cases)
          ? parsed.cases.flatMap((item) => {
              if (
                typeof item.caseId !== 'string' ||
                typeof item.companyId !== 'string' ||
                typeof item.projectId !== 'string' ||
                typeof item.houseId !== 'string'
              ) {
                return [];
              }
              return [{
                caseId: item.caseId,
                companyId: item.companyId,
                projectId: item.projectId,
                houseId: item.houseId,
                processingStatus:
                  item.processingStatus === 'accepted' ? 'accepted' : 'new',
              }];
            })
          : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { cases: [] };
      }
      throw error;
    }
  }

  private async write(state: CaseProcessingState): Promise<void> {
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
