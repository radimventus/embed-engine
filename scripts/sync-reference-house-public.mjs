#!/usr/bin/env node
/**
 * Publish packages/reference-house → apps/client-studio/public/reference-house
 * for Tour / SPA consumption (PT-TOUR-01).
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "packages/reference-house");
const target = path.join(
  root,
  "apps/client-studio/public/reference-house",
);

if (!existsSync(path.join(source, "house.json"))) {
  throw new Error(`Missing ${source}/house.json`);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(path.join(source, "house.json"), path.join(target, "house.json"));
cpSync(path.join(source, "assets"), path.join(target, "assets"), {
  recursive: true,
  filter: (src) => !src.includes(".DS_Store"),
});

console.log(`Published reference-house → ${target}`);
