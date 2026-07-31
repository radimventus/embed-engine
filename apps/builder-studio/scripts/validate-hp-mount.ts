import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mountHousePackage } from '../src/features/house-package/mountHousePackage';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const root = join(repoRoot, 'apps/client-studio/public/house-package');

async function main() {
  const mount = await mountHousePackage({
    fetchText: async (url) => {
      const rel = url.replace('/house-package/', '');
      return readFileSync(join(root, rel), 'utf8');
    },
    probeExists: async (url) => {
      try {
        readFileSync(join(root, url.replace('/house-package/', '')));
        return true;
      } catch {
        return false;
      }
    },
  });

  if (!mount.ok || mount.builderImport === null) {
    console.error('FAIL', mount.errors);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: mount.ok,
        rooms: mount.builderImport.rooms.rooms.length,
        gallery: mount.builderImport.gallery.entries.length,
        videos: mount.builderImport.videos.entries.length,
        floors: mount.builderImport.floors.floors.length,
        hero: mount.heroRelativePath,
        sampleRooms: mount.builderImport.rooms.rooms
          .slice(0, 3)
          .map((room) => room.name),
      },
      null,
      2,
    ),
  );
}

void main();
