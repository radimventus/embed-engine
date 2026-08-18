import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';

import { platformApiStatePath } from './platformApiConfig';

export type HousePackagePersistFiles = {
  readonly roomsCsv?: string;
  readonly galleryCsv?: string;
  readonly videosCsv?: string;
  readonly manifestJson?: string | null;
};

export type DurableHousePackage = {
  readonly houseId: string;
  readonly files: HousePackagePersistFiles;
  readonly updatedAt: string;
};

export type HousePackageMedia = {
  readonly bytes: Buffer;
  readonly contentType: string;
};

export interface HousePackageRepository {
  resolveStorageRoot(houseId: string): string;
  initialize(houseId: string): Promise<DurableHousePackage>;
  get(houseId: string): Promise<DurableHousePackage | null>;
  persist(houseId: string, files: HousePackagePersistFiles): Promise<DurableHousePackage>;
  writeMedia(houseId: string, mediaPath: string, media: HousePackageMedia): Promise<void>;
  readMedia(houseId: string, mediaPath: string): Promise<HousePackageMedia | null>;
  deleteMedia(houseId: string, mediaPath: string): Promise<boolean>;
}

type StoredMedia = {
  readonly contentType: string;
};

const TEXT_STATE_FILE = 'package.json';
const MEDIA_METADATA_SUFFIX = '.metadata.json';

function defaultStorageRoot(): string {
  return platformApiStatePath('house-packages');
}

function storageKey(houseId: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$/.test(houseId)) {
    throw new Error('Invalid House Package houseId.');
  }
  return Buffer.from(houseId, 'utf8').toString('base64url');
}

function childPath(root: string, ...parts: readonly string[]): string {
  const parent = resolve(root);
  const child = resolve(parent, ...parts);
  const pathFromParent = relative(parent, child);
  if (pathFromParent === '' || pathFromParent === '..' || pathFromParent.startsWith(`..${sep}`)) {
    throw new Error('House Package storage escaped durable state root.');
  }
  return child;
}

function normalizeMediaPath(mediaPath: string): string[] {
  const decoded = decodeURIComponent(mediaPath);
  const parts = decoded.split('/');
  if (
    parts.length === 0 ||
    parts.some(
      (part) =>
        !/^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$/.test(part) ||
        part === '.' ||
        part === '..',
    )
  ) {
    throw new Error('Invalid House Package media path.');
  }
  return parts;
}

/**
 * The API owns the durable `media/` storage root. Browser-facing package paths
 * may still contain that conventional prefix, but it must not be persisted a
 * second time below the API media root.
 */
function canonicalMediaPath(mediaPath: string): string[] {
  const parts = normalizeMediaPath(mediaPath);
  const canonical = parts[0] === 'media' ? parts.slice(1) : parts;
  if (canonical.length === 0) {
    throw new Error('Invalid House Package media path.');
  }
  return canonical;
}
function normalizePersistFiles(files: HousePackagePersistFiles): HousePackagePersistFiles {
  const normalized: HousePackagePersistFiles = {};
  if (typeof files.roomsCsv === 'string') Object.assign(normalized, { roomsCsv: files.roomsCsv });
  if (typeof files.galleryCsv === 'string') Object.assign(normalized, { galleryCsv: files.galleryCsv });
  if (typeof files.videosCsv === 'string') Object.assign(normalized, { videosCsv: files.videosCsv });
  if (typeof files.manifestJson === 'string' || files.manifestJson === null) {
    Object.assign(normalized, { manifestJson: files.manifestJson });
  }
  return normalized;
}

function isValidContentType(contentType: string): boolean {
  return contentType.trim().length > 0 && contentType.length <= 256 && !/[\r\n]/.test(contentType);
}

export class FileHousePackageRepository implements HousePackageRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    readonly storageRoot = defaultStorageRoot(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  resolveStorageRoot(houseId: string): string {
    return childPath(this.storageRoot, storageKey(houseId));
  }

  async initialize(houseId: string): Promise<DurableHousePackage> {
    return this.exclusively(async () => {
      const existing = await this.get(houseId);
      if (existing !== null) return existing;
      const created = { houseId, files: {}, updatedAt: this.now().toISOString() };
      await this.writeState(created);
      return created;
    });
  }

  async get(houseId: string): Promise<DurableHousePackage | null> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath(houseId), 'utf8')) as Partial<DurableHousePackage>;
      if (
        parsed.houseId !== houseId ||
        typeof parsed.updatedAt !== 'string' ||
        parsed.files === null ||
        typeof parsed.files !== 'object'
      ) {
        throw new Error('Invalid durable House Package state.');
      }
      return { houseId, files: normalizePersistFiles(parsed.files), updatedAt: parsed.updatedAt };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async persist(houseId: string, files: HousePackagePersistFiles): Promise<DurableHousePackage> {
    return this.exclusively(async () => {
      const current = await this.get(houseId);
      const persisted = {
        houseId,
        files: { ...(current?.files ?? {}), ...normalizePersistFiles(files) },
        updatedAt: this.now().toISOString(),
      };
      await this.writeState(persisted);
      return persisted;
    });
  }

  async writeMedia(houseId: string, mediaPath: string, media: HousePackageMedia): Promise<void> {
    if (!Buffer.isBuffer(media.bytes) || !isValidContentType(media.contentType)) {
      throw new Error('Invalid House Package media.');
    }
    await this.exclusively(async () => {
      const target = this.mediaPath(houseId, mediaPath);
      await this.atomicWrite(target, media.bytes);
      await this.atomicWrite(
        `${target}${MEDIA_METADATA_SUFFIX}`,
        JSON.stringify({ contentType: media.contentType.trim() } satisfies StoredMedia),
      );
    });
  }

  async readMedia(houseId: string, mediaPath: string): Promise<HousePackageMedia | null> {
    const canonical = this.mediaPath(houseId, mediaPath);
    const legacy = this.legacyMediaPath(houseId, mediaPath);
    const legacyPrefixed = this.legacyMediaPath(houseId, `media/${mediaPath}`);
    for (const target of new Set([canonical, legacy, legacyPrefixed])) {
      try {
        const [bytes, metadata] = await Promise.all([
          readFile(target),
          readFile(`${target}${MEDIA_METADATA_SUFFIX}`, 'utf8'),
        ]);
        const parsed = JSON.parse(metadata) as Partial<StoredMedia>;
        if (typeof parsed.contentType !== 'string' || !isValidContentType(parsed.contentType)) {
          throw new Error('Invalid durable House Package media metadata.');
        }
        return { bytes, contentType: parsed.contentType };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    return null;
  }

  async deleteMedia(houseId: string, mediaPath: string): Promise<boolean> {
    return this.exclusively(async () => {
      const canonical = this.mediaPath(houseId, mediaPath);
      const legacy = this.legacyMediaPath(houseId, mediaPath);
      const legacyPrefixed = this.legacyMediaPath(houseId, `media/${mediaPath}`);
      let deleted = false;
      for (const target of new Set([canonical, legacy, legacyPrefixed])) {
        try {
          await rm(target);
          await rm(`${target}${MEDIA_METADATA_SUFFIX}`, { force: true });
          deleted = true;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
      }
      return deleted;
    });
  }

  private statePath(houseId: string): string {
    return childPath(this.resolveStorageRoot(houseId), TEXT_STATE_FILE);
  }

  private mediaPath(houseId: string, mediaPath: string): string {
    return childPath(this.resolveStorageRoot(houseId), 'media', ...canonicalMediaPath(mediaPath));
  }

  /** Previous releases stored a second `media/` directory; retain read/delete compatibility. */
  private legacyMediaPath(houseId: string, mediaPath: string): string {
    return childPath(this.resolveStorageRoot(houseId), 'media', ...normalizeMediaPath(mediaPath));
  }

  private async writeState(value: DurableHousePackage): Promise<void> {
    await this.atomicWrite(this.statePath(value.houseId), JSON.stringify(value));
  }

  private async atomicWrite(target: string, value: string | Buffer): Promise<void> {
    await mkdir(dirname(target), { recursive: true });
    const temporary = `${target}.${randomBytes(6).toString('hex')}.tmp`;
    await writeFile(temporary, value, { mode: 0o600 });
    await rename(temporary, target);
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolvePromise) => {
      release = resolvePromise;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
