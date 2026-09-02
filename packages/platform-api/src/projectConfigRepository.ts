import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { normalizeProjectPrivacyUrl } from '@embed-engine/platform-access';

import { platformApiStatePath } from './platformApiConfig';

export type DurableProjectConfig = {
  readonly projectId: string;
  readonly privacyUrl: string | null;
  readonly billingNumber: string | null;
  readonly commercialProgramId: string | null;
  readonly commercialProgramSelectedAt: string | null;
};

export type ProjectBillingAllocation = {
  readonly projectId: string;
  readonly billingNumber: string;
};

export type DurableProjectConfigInput = {
  readonly projectId: string;
  readonly privacyUrl: unknown;
  readonly billingNumber?: unknown;
  readonly commercialProgramId?: string | null;
  readonly commercialProgramSelectedAt?: string | null;
};

export interface ProjectConfigRepository {
  get(projectId: string): Promise<DurableProjectConfig | null>;
  list(): Promise<readonly DurableProjectConfig[]>;
  upsert(input: DurableProjectConfigInput): Promise<DurableProjectConfig>;
  ensureBillingNumber(
    projectId: string,
    createdAt?: string,
  ): Promise<ProjectBillingAllocation>;
}

type ProjectConfigState = {
  readonly projects: readonly DurableProjectConfig[];
};

function normalizeBillingNumber(
  value: unknown,
): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !/^\d{5}$/.test(value)
  ) {
    throw new Error('Invalid Project billing number.');
  }

  return value;
}

function billingPrefixFromIso(
  iso: string,
): string {
  const year =
    new Date(iso).getUTCFullYear();

  if (!Number.isInteger(year)) {
    throw new Error('Invalid billing allocation date.');
  }

  return String(year).slice(-2);
}

function normalizeCommercialProgramId(
  value: unknown,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(
      'Invalid commercial program.',
    );
  }

  const normalized = value.trim();

  return normalized.length === 0
    ? null
    : normalized;
}

function normalizeCommercialProgramSelectedAt(
  value: unknown,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(
      'Invalid commercial program selection timestamp.',
    );
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  const parsed = new Date(normalized);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString() !== normalized
  ) {
    throw new Error(
      'Invalid commercial program selection timestamp.',
    );
  }

  return normalized;
}

function normalizeStored(
  item: DurableProjectConfig,
): DurableProjectConfig | null {
  const projectId = item.projectId.trim();

  if (projectId.length === 0) {
    return null;
  }

  try {
    return {
      projectId,
      privacyUrl:
        normalizeProjectPrivacyUrl(
          item.privacyUrl,
        ),
      billingNumber:
        normalizeBillingNumber(
          item.billingNumber,
        ),
      commercialProgramId:
        normalizeCommercialProgramId(
          item.commercialProgramId,
        ),
      commercialProgramSelectedAt:
        normalizeCommercialProgramSelectedAt(
          item.commercialProgramSelectedAt,
        ),
    };
  } catch {
    return null;
  }
}

function validate(input: DurableProjectConfigInput): DurableProjectConfig {
  const projectId =
    typeof input.projectId === 'string' ? input.projectId.trim() : '';
  if (projectId.length === 0) {
    throw new Error('Invalid project configuration.');
  }
  return {
    projectId,
    privacyUrl:
      normalizeProjectPrivacyUrl(
        input.privacyUrl,
      ),
    billingNumber:
      normalizeBillingNumber(
        input.billingNumber,
      ),
    commercialProgramId:
      normalizeCommercialProgramId(
        input.commercialProgramId,
      ),
    commercialProgramSelectedAt:
      normalizeCommercialProgramSelectedAt(
        input.commercialProgramSelectedAt,
      ),
  };
}

export class FileProjectConfigRepository implements ProjectConfigRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly statePath = platformApiStatePath('project-config.json'),
  ) {}

  async get(projectId: string): Promise<DurableProjectConfig | null> {
    const normalized = projectId.trim();
    if (normalized.length === 0) return null;
    return (
      (await this.read()).projects.find((item) => item.projectId === normalized) ??
      null
    );
  }

  async list(): Promise<readonly DurableProjectConfig[]> {
    return (await this.read()).projects;
  }

  async upsert(
    input: DurableProjectConfigInput,
  ): Promise<DurableProjectConfig> {
    const config = validate(input);

    return this.exclusively(async () => {
      const state = await this.read();

      const existing =
        state.projects.find(
          (item) =>
            item.projectId ===
            config.projectId,
        );

      const saved: DurableProjectConfig = {
        ...config,
        billingNumber:
          config.billingNumber ??
          existing?.billingNumber ??
          null,
        commercialProgramId:
          config.commercialProgramId ??
          existing?.commercialProgramId ??
          null,
        commercialProgramSelectedAt:
          config.commercialProgramSelectedAt ??
          existing?.commercialProgramSelectedAt ??
          null,
      };

      const projects = [
        ...state.projects.filter(
          (item) =>
            item.projectId !==
            saved.projectId,
        ),
        saved,
      ];

      await this.write({
        projects,
      });

      return saved;
    });
  }

  async selectCommercialProgram(
    projectIdInput: string,
    programIdInput: string,
    selectedAt = new Date().toISOString(),
  ): Promise<DurableProjectConfig> {
    const projectId =
      projectIdInput.trim();

    const programId =
      programIdInput.trim();

    if (
      projectId.length === 0 ||
      programId.length === 0
    ) {
      throw new Error(
        'Invalid commercial program selection.',
      );
    }

    const normalizedSelectedAt =
      normalizeCommercialProgramSelectedAt(
        selectedAt,
      );

    if (normalizedSelectedAt === null) {
      throw new Error(
        'Invalid commercial program selection timestamp.',
      );
    }

    return this.exclusively(async () => {
      const state = await this.read();

      const existing =
        state.projects.find(
          (item) =>
            item.projectId === projectId,
        );

      const sameProgram =
        existing !== undefined &&
        existing.commercialProgramId ===
          programId;

      const effectiveSelectedAt =
        sameProgram &&
        existing
          .commercialProgramSelectedAt !==
          null
          ? existing
              .commercialProgramSelectedAt
          : normalizedSelectedAt;

      const saved: DurableProjectConfig = {
        projectId,
        privacyUrl:
          existing?.privacyUrl ?? null,
        billingNumber:
          existing?.billingNumber ?? null,
        commercialProgramId:
          programId,
        commercialProgramSelectedAt:
          effectiveSelectedAt,
      };

      const projects = [
        ...state.projects.filter(
          (item) =>
            item.projectId !== projectId,
        ),
        saved,
      ];

      await this.write({
        projects,
      });

      return saved;
    });
  }

  async ensureBillingNumber(
    projectIdInput: string,
    createdAt = new Date().toISOString(),
  ): Promise<ProjectBillingAllocation> {
    const projectId =
      projectIdInput.trim();

    if (projectId.length === 0) {
      throw new Error(
        'Invalid Project billing identity.',
      );
    }

    return this.exclusively(
      async () => {
        const state =
          await this.read();

        const existing =
          state.projects.find(
            (item) =>
              item.projectId ===
              projectId,
          );

        if (
          existing?.billingNumber
        ) {
          return {
            projectId,
            billingNumber:
              existing.billingNumber,
          };
        }

        const prefix =
          billingPrefixFromIso(
            createdAt,
          );

        const used =
          state.projects.flatMap(
            (item) => {
              const value =
                item.billingNumber;

              if (
                value === null ||
                !value.startsWith(
                  prefix,
                )
              ) {
                return [];
              }

              const sequence =
                Number.parseInt(
                  value.slice(2),
                  10,
                );

              return Number.isInteger(
                sequence,
              )
                ? [sequence]
                : [];
            },
          );

        const nextSequence =
          Math.max(
            9,
            ...used,
          ) + 1;

        if (
          nextSequence > 999
        ) {
          throw new Error(
            'Project billing sequence exhausted.',
          );
        }

        const billingNumber =
          prefix +
          String(
            nextSequence,
          ).padStart(
            3,
            '0',
          );

        const config:
          DurableProjectConfig = {
            projectId,
            privacyUrl:
              existing?.privacyUrl ??
              null,
            billingNumber,
          };

        const projects = [
          ...state.projects.filter(
            (item) =>
              item.projectId !==
              projectId,
          ),
          config,
        ];

        await this.write({
          projects,
        });

        return {
          projectId,
          billingNumber,
        };
      },
    );
  }

  private async read(): Promise<ProjectConfigState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as Partial<ProjectConfigState>;
      const projects = Array.isArray(parsed.projects)
        ? parsed.projects.flatMap((item) => {
            if (item === null || typeof item !== 'object') return [];
            const stored = normalizeStored(item as DurableProjectConfig);
            return stored === null ? [] : [stored];
          })
        : [];
      return { projects };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { projects: [] };
      }
      throw error;
    }
  }

  private async write(state: ProjectConfigState): Promise<void> {
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
