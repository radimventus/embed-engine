import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, "..");

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const name of entries) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listSourceFiles(path));
      continue;
    }
    if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
      files.push(path);
    }
  }
  return files;
}

/**
 * PT-004 — no vendor lock-in in LLM Foundation or Runtime.
 */
describe("PT-004 vendor neutrality", () => {
  it("AI package sources omit vendor SDK imports and API key env names", () => {
    const forbidden = [
      'from "openai"',
      "from 'openai'",
      'from "@anthropic',
      "from '@anthropic",
      "@google/generative-ai",
      "api.openai.com",
      "OPENAI_API_KEY",
      "ANTHROPIC_API_KEY",
      "GOOGLE_API_KEY",
    ];

    const sources = listSourceFiles(join(packageRoot, "src"));
    assert.ok(sources.length > 0);

    for (const file of sources) {
      const code = readFileSync(file, "utf8");
      for (const token of forbidden) {
        assert.equal(
          code.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    for (const name of Object.keys(deps)) {
      assert.equal(
        /openai|anthropic|generative-ai|gemini/i.test(name),
        false,
        `package.json must not depend on ${name}`,
      );
    }
  });

  it("Runtime package does not depend on @embed-engine/ai", () => {
    const runtimePkg = JSON.parse(
      readFileSync(
        join(packageRoot, "..", "runtime", "package.json"),
        "utf8",
      ),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = {
      ...runtimePkg.dependencies,
      ...runtimePkg.devDependencies,
    };
    assert.equal(deps["@embed-engine/ai"], undefined);
  });
});
