import {randomUUID} from 'node:crypto';
import {mkdir, open, rename, readFile, readdir, unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {platformApiStatePath} from './platformApiConfig';

export type ManagerFeedback = {
  feedbackId: string; createdAt: string; userId: string | null; companyId: string | null;
  projectId: string | null; surface: 'MANAGER'; currentUrl: string | null; message: string; status: 'NEW';
  notificationStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  notificationError?: string | null; notificationProviderId?: string | null; notifiedAt?: string | null;
};
export interface FeedbackRepository {
  create(input: Omit<ManagerFeedback, 'feedbackId' | 'createdAt' | 'status' | 'surface'>): Promise<ManagerFeedback>;
  list(): Promise<readonly ManagerFeedback[]>;
  get(id: string): Promise<ManagerFeedback | null>;
  updateNotification(id: string, update: Pick<ManagerFeedback, 'notificationStatus' | 'notificationError' | 'notificationProviderId' | 'notifiedAt'>): Promise<ManagerFeedback>;
}

/** One atomic file per record avoids concurrent submissions overwriting one another. */
export class FileFeedbackRepository implements FeedbackRepository {
  constructor(readonly directory = platformApiStatePath('manager-feedback')) {}
  async create(input: Omit<ManagerFeedback, 'feedbackId' | 'createdAt' | 'status' | 'surface'>): Promise<ManagerFeedback> {
    const entry: ManagerFeedback = {...input, message: input.message.trim(), feedbackId: randomUUID(),
      createdAt: new Date().toISOString(), status: 'NEW', surface: 'MANAGER', notificationStatus: 'PENDING',
      notificationError: null, notificationProviderId: null, notifiedAt: null};
    await mkdir(this.directory, {recursive: true});
    const temp = join(this.directory, `${entry.feedbackId}.tmp`);
    try {
      const file = await open(temp, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify(entry)); await file.sync(); } finally { await file.close(); }
      await rename(temp, join(this.directory, `${entry.feedbackId}.json`));
      return entry;
    } catch (error) { await unlink(temp).catch(() => undefined); throw error; }
  }
  async updateNotification(id: string, update: Pick<ManagerFeedback, 'notificationStatus' | 'notificationError' | 'notificationProviderId' | 'notifiedAt'>): Promise<ManagerFeedback> {
    const current = await this.get(id);
    if (current === null) throw new Error('Feedback record does not exist.');
    const next = {...current, ...update};
    const target = join(this.directory, `${id}.json`);
    const temp = join(this.directory, `${id}.notification.tmp`);
    try {
      const file = await open(temp, 'w', 0o600);
      try { await file.writeFile(JSON.stringify(next)); await file.sync(); } finally { await file.close(); }
      await rename(temp, target);
      return next;
    } catch (error) { await unlink(temp).catch(() => undefined); throw error; }
  }
  async get(id: string): Promise<ManagerFeedback | null> {
    if (!/^[a-f0-9-]{36}$/.test(id)) return null;
    try { return JSON.parse(await readFile(join(this.directory, `${id}.json`), 'utf8')) as ManagerFeedback; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  }
  async list(): Promise<readonly ManagerFeedback[]> {
    let names: string[];
    try { names = await readdir(this.directory); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
    const records = await Promise.all(names.filter(x => x.endsWith('.json')).map(x => this.get(x.slice(0, -5))));
    return records.filter((x): x is ManagerFeedback => x !== null).sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,100);
  }
}
