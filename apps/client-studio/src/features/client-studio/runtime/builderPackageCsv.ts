import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../public/house-package',
);

/** Node / test loader — reads HP-002 CSVs from public package root. */
export const galleryCsv = readFileSync(join(packageRoot, 'gallery.csv'), 'utf8');
export const roomsCsv = readFileSync(join(packageRoot, 'rooms.csv'), 'utf8');
export const videosCsv = readFileSync(join(packageRoot, 'videos.csv'), 'utf8');
