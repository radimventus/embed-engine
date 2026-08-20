import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { normalizeProjectPrivacyUrl } from '@embed-engine/platform-access';

import { platformApiStatePath } from './platformApiConfig';

export type DurableProjectConfig = {
  readonly projectId: string;
  readonly privacyUrl: string | null;
};

export type DurableProjectConfigInput = {
  readonly projectId: string;
  readonly privacyUrl: unknown;
};

export interface ProjectConfigRepository {
  get(projectId: string): Promise<DurableProjectConfig | null>;
  list(): Promise<readonly DurableProjectConfig[]>;
  upsert(input: DurableProjectConfigInput): Promise<DurableProjectConfig>;
}

type ProjectConfigState = {
  readonly projects: readonly DurableProjectConfig[];
};

function normalizeStored(item: DurableProjectConfig): DurableProjectConfig | null {
  const projectId = item.projectId.trim();
  if (projectId.length === 0) return null;
  try {
    return {
      projectId,
      privacyUrl: normalizeProjectPrivacyUrl(item.privacyUrl),
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
    privacyUrl: normalizeProjectPrivacyUrl(input.privacyUrl),
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

  async upsert(input: DurableProjectConfigInput): Promise<DurableProjectConfig> {
    const config = validate(input);
    return this.exclusively(async () => {
      const state = await this.read();
      const projects = [
        ...state.projects.filter((item) => item.projectId !== config.projectId),
        config,
      ];
      await this.write({ projects });
      return config;
    });
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
