
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;
mkdirSync(outDir, { recursive: true });

const { chromium } = await import(
  "/Users/radimventus/embed-engine/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.js"
);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const result = { url: "http://127.0.0.1:4173/" };

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle", timeout: 45000 });

const envProbe = await page.evaluate(async () => {
  const modUrl =
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/adapter/openai/createLocalDevDelivery.ts";
  const mod = await import(modUrl);
  const delivery = mod.tryCreateLocalDevDelivery();

  const meta = import.meta;
  const dynamicKey = meta.env?.["VITE_OPENAI_API_KEY"];
  const staticKey = meta.env?.VITE_OPENAI_API_KEY;
  const envKeys = meta.env ? Object.keys(meta.env) : [];
  const viteKeys = envKeys.filter((k) => k.startsWith("VITE_"));

  let processNodeEnv;
  let processOpenAILen = 0;
  try {
    processNodeEnv = process?.env?.NODE_ENV;
    const k = process?.env?.OPENAI_API_KEY;
    processOpenAILen = typeof k === "string" ? k.length : 0;
  } catch (e) {
    processNodeEnv = "process-throw:" + String(e);
  }

  return {
    tryCreateLocalDevDeliveryNull: delivery === null,
    tryCreateLocalDevDeliveryId: delivery?.id ?? null,
    dynamicKeyType: typeof dynamicKey,
    dynamicKeyLen: typeof dynamicKey === "string" ? dynamicKey.length : 0,
    staticKeyType: typeof staticKey,
    staticKeyLen: typeof staticKey === "string" ? staticKey.length : 0,
    importMetaEnvDefined: typeof meta.env !== "undefined",
    viteKeyCount: viteKeys.length,
    viteKeysSample: viteKeys.slice(0, 40),
    hasVITE_OPENAI_API_KEY_in_keys: viteKeys.includes("VITE_OPENAI_API_KEY"),
    hasVITE_OPENAI_MODEL_in_keys: viteKeys.includes("VITE_OPENAI_MODEL"),
    hasVITE_AI_DELIVERY_URL_in_keys: viteKeys.includes("VITE_AI_DELIVERY_URL"),
    processNodeEnv,
    processOpenAILen,
  };
});
result.envProbe = envProbe;

const deliveryProbe = await page.evaluate(async () => {
  const mod = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/delivery/createEmbedAIDelivery.ts"
  );
  const binding = mod.resolveEmbedAIDeliveryBinding({ mode: "auto" });
  const delivery = mod.createEmbedAIDelivery({ mode: "auto" });
  const forcedLocal = mod.createEmbedAIDelivery({ mode: "local" });
  return {
    binding,
    autoDeliveryId: delivery.id,
    localDeliveryId: forcedLocal.id,
  };
});
result.deliveryProbe = deliveryProbe;

const instanceofProbe = await page.evaluate(async () => {
  const a = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/services/ConversationError.ts"
  );
  const b = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/index.ts"
  );
  const err = new a.ConversationError("missing_api_key", "test-msg");
  return {
    sameClass: a.ConversationError === b.ConversationError,
    instanceofViaIndex: err instanceof b.ConversationError,
    instanceofViaDirect: err instanceof a.ConversationError,
  };
});
result.instanceofProbe = instanceofProbe;

writeFileSync(resolve(outDir, "browser-studio.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
