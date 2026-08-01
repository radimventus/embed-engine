/**
 * PR-003A validation — stress /api/workspace/active without browser.
 * Run against live Builder Vite on 4177.
 */

const BASE = process.env.BUILDER_URL ?? 'http://127.0.0.1:4177';

const HOUSES = [
  {
    id: 'family-98',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
    folder: 'project-ac-modular-pilot',
  },
  {
    id: 'harmony-124',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    folder: 'project-ac-modular-pilot',
  },
  {
    id: 'villa-168',
    packageRoot: 'apps/client-studio/public/house-package',
    folder: 'project-ac-modular-pilot',
  },
  {
    id: 'opava-harmony',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    folder: 'project-opava-pilot',
  },
  {
    id: 'opava-family',
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
    folder: 'project-opava-pilot',
  },
  {
    id: 'brno-villa',
    packageRoot: 'apps/client-studio/public/house-package',
    folder: 'project-brno-pilot',
  },
  {
    id: 'brno-harmony',
    packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
    folder: 'project-brno-pilot',
  },
];

const FOLDERS = [
  'project-ac-modular-pilot',
  'project-opava-pilot',
  'project-brno-pilot',
];

async function activate(house) {
  const started = Date.now();
  const response = await fetch(`${BASE}/api/workspace/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: house.id,
      packageRoot: house.packageRoot,
    }),
  });
  const json = await response.json();
  const ms = Date.now() - started;
  if (!response.ok || json.ok !== true) {
    throw new Error(
      `FAIL activate ${house.id}: HTTP ${response.status} ${JSON.stringify(json)} (${ms}ms)`,
    );
  }
  if (json.projectId !== house.id) {
    throw new Error(
      `FAIL activate ${house.id}: server projectId=${json.projectId}`,
    );
  }
  if (
    typeof json.error === 'string' &&
    json.error.includes('vypršela')
  ) {
    throw new Error(`FAIL timeout message for ${house.id}`);
  }
  return ms;
}

async function main() {
  let projectSwitches = 0;
  let houseSwitches = 0;
  const timings = [];

  // Project switches: open first house of each folder, ≥30 times.
  for (let i = 0; i < 30; i += 1) {
    const folderId = FOLDERS[i % FOLDERS.length];
    const house = HOUSES.find((item) => item.folder === folderId);
    if (house === undefined) {
      throw new Error(`No house for folder ${folderId}`);
    }
    const ms = await activate(house);
    timings.push(ms);
    projectSwitches += 1;
  }

  // House switches within/across projects ≥30 times.
  for (let i = 0; i < 30; i += 1) {
    const house = HOUSES[i % HOUSES.length];
    const ms = await activate(house);
    timings.push(ms);
    houseSwitches += 1;
  }

  // Create-like activation of a new id on existing package root.
  const created = {
    id: `review-create-${Date.now()}`,
    packageRoot: 'apps/client-studio/public/house-packages/family-98',
    folder: 'created',
  };
  await activate(created);

  // Return to AC Modular villa.
  await activate(HOUSES[2]);

  // Repeat a burst of 10 more mixed switches.
  for (let i = 0; i < 10; i += 1) {
    await activate(HOUSES[i % HOUSES.length]);
    houseSwitches += 1;
  }

  const max = Math.max(...timings);
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;

  console.log(
    JSON.stringify(
      {
        ok: true,
        projects: FOLDERS.length,
        houses: HOUSES.length,
        projectSwitches,
        houseSwitches,
        createActivate: 'PASS',
        activateAvgMs: Math.round(avg),
        activateMaxMs: max,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
