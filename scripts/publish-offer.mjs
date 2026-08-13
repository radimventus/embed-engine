#!/usr/bin/env node
/**
 * Build the public Offer Experience as a GitHub Pages artifact.
 *
 * Usage:
 *   pnpm offer:publish
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OFFER_BASE = '/offer/';
const PLATFORM_API_ORIGIN =
  'https://embed-engineclient-studio-production.up.railway.app';
const OFFER_SLUGS = ['domy-s-energi', 'blokki'];
const appDirectory = 'apps/offer-experience';
const distDirectory = path.join(repoRoot, appDirectory, 'dist');
const stageDirectory = path.join(repoRoot, '.offer-publish-staging');
const stageOfferDirectory = path.join(stageDirectory, 'offer');
const publishedOfferDirectory = path.join(repoRoot, 'docs', 'offer');

function fail(message) {
  console.error(`\nOffer publish FAILED\n${message}\n`);
  process.exit(1);
}

function assertFile(filePath, description) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`Missing ${description}: ${path.relative(repoRoot, filePath)}`);
  }
}

function assertDirectory(directoryPath, description) {
  if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
    fail(`Missing ${description}: ${path.relative(repoRoot, directoryPath)}`);
  }
}

function runBuild() {
  const result = spawnSync(
    'pnpm',
    ['--filter', '@embed-engine/offer-experience', 'build'],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_BASE: OFFER_BASE,
        VITE_PLATFORM_API_ORIGIN: PLATFORM_API_ORIGIN,
      },
      shell: process.platform === 'win32',
    },
  );
  if (result.status !== 0) {
    fail(`Offer build exited with code ${result.status ?? 1}`);
  }
}

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(entryPath) : [entryPath];
  });
}

function validateProductionBundle(directory) {
  assertFile(path.join(directory, 'index.html'), 'Offer entry document');
  assertDirectory(path.join(directory, 'assets'), 'Offer asset directory');

  const bundle = filesIn(directory)
    .filter((filePath) => /\.(?:html|js|css|json)$/.test(filePath))
    .map((filePath) => readFileSync(filePath, 'utf8'))
    .join('\n');

  if (!bundle.includes(PLATFORM_API_ORIGIN)) {
    fail('Offer bundle is not configured with the production Platform API origin');
  }
  if (bundle.includes('VITE_PLATFORM_API_ORIGIN')) {
    fail('Offer bundle contains an unresolved Platform API environment variable');
  }
  if (bundle.includes('http://127.0.0.1') || bundle.includes('http://localhost')) {
    fail('Offer bundle contains a local Platform API origin');
  }
  if (/(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----)/.test(bundle)) {
    fail('Offer bundle contains a high-confidence secret pattern');
  }
}

function stageDeepLinks() {
  const index = path.join(stageOfferDirectory, 'index.html');
  for (const slug of OFFER_SLUGS) {
    const slugDirectory = path.join(stageOfferDirectory, slug);
    mkdirSync(slugDirectory, { recursive: true });
    cpSync(index, path.join(slugDirectory, 'index.html'));
  }
  cpSync(index, path.join(stageOfferDirectory, '404.html'));
}

function writeReleaseMetadata() {
  writeFileSync(
    path.join(stageOfferDirectory, 'release.json'),
    `${JSON.stringify(
      {
        base: OFFER_BASE,
        platformApiOrigin: PLATFORM_API_ORIGIN,
        slugs: OFFER_SLUGS,
      },
      null,
      2,
    )}\n`,
  );
}

function validateStage() {
  validateProductionBundle(stageOfferDirectory);
  for (const slug of OFFER_SLUGS) {
    assertFile(
      path.join(stageOfferDirectory, slug, 'index.html'),
      `Offer deep link for ${slug}`,
    );
  }
  assertFile(path.join(stageOfferDirectory, '404.html'), 'Offer deep-link fallback');
  assertFile(path.join(stageOfferDirectory, 'release.json'), 'Offer release metadata');
}

console.log('════════════════════════════════════════════════════════');
console.log('Publish CONIS Offer Experience');
console.log(`Base: ${OFFER_BASE}`);
console.log(`Platform API: ${PLATFORM_API_ORIGIN}`);
console.log('════════════════════════════════════════════════════════');

runBuild();
rmSync(stageDirectory, { recursive: true, force: true });
mkdirSync(stageOfferDirectory, { recursive: true });
cpSync(distDirectory, stageOfferDirectory, { recursive: true });
stageDeepLinks();
writeReleaseMetadata();
validateStage();

rmSync(publishedOfferDirectory, { recursive: true, force: true });
renameSync(stageOfferDirectory, publishedOfferDirectory);
rmSync(stageDirectory, { recursive: true, force: true });

console.log('\nOffer Experience READY');
console.log('Paths:');
for (const slug of OFFER_SLUGS) {
  console.log(`  https://conis.cz/offer/${slug}/`);
}
