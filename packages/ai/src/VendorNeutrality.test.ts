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

function isOpenAIVendorFile(file: string): boolean {
  return /[/\\]adapter[/\\]openai[/\\]/.test(file);
}

/**
 * PT-004 / PT-006 / CAP-AI-ADAPTER-01 — vendor neutrality.
 * OpenAI mapping may live only inside adapter/openai.
 */
describe("PT-004 / PT-006 / CAP-AI-ADAPTER-01 vendor neutrality", () => {
  it("non-adapter sources omit vendor SDK imports and API secrets", () => {
    const forbiddenEverywhere = [
      'from "openai"',
      "from 'openai'",
      'from "@anthropic',
      "from '@anthropic",
      "@google/generative-ai",
    ];

    const forbiddenOutsideOpenAIAdapter = [
      "api.openai.com",
      "OPENAI_API_KEY",
      "OPENAI_MODEL",
      "ANTHROPIC_API_KEY",
      "GOOGLE_API_KEY",
    ];

    const sources = listSourceFiles(join(packageRoot, "src"));
    assert.ok(sources.length > 0);

    for (const file of sources) {
      const code = readFileSync(file, "utf8");
      for (const token of forbiddenEverywhere) {
        assert.equal(
          code.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }

      if (isOpenAIVendorFile(file)) {
        continue;
      }

      for (const token of forbiddenOutsideOpenAIAdapter) {
        assert.equal(
          code.includes(token),
          false,
          `${file} must not contain ${token} (OpenAI stays in adapter/openai)`,
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

  it("Delivery and Runtime do not import OpenAI Adapter", () => {
    const deliveryDir = join(packageRoot, "src", "delivery");
    const runtimeService = join(
      packageRoot,
      "src",
      "services",
      "AIService.ts",
    );

    for (const file of listSourceFiles(deliveryDir)) {
      const code = readFileSync(file, "utf8");
      assert.equal(
        /from\s+["'][^"']*openai|OpenAIAdapter|OpenAIProvider|OPENAI_|api\.openai\.com/i.test(
          code,
        ),
        false,
        `${file} must stay vendor-neutral`,
      );
      assert.equal(
        /\bfetch\s*\(|authorization|Bearer /i.test(code),
        false,
        `${file} must not contain HTTP transport`,
      );
    }

    const aiService = readFileSync(runtimeService, "utf8");
    assert.doesNotMatch(aiService, /OpenAI|adapter\/openai|OPENAI_/);
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
