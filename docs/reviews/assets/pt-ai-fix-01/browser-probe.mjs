/**
 * PT-AI-FIX-01 — browser probe via Client Studio Vite (static import.meta.env).
 * Avoid import.meta inside page.evaluate (Playwright cannot serialize it).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(__dirname, { recursive: true });

const pw = await import(
  "/Users/radimventus/embed-engine/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.js"
);
const chromium = pw.chromium ?? pw.default?.chromium;
if (!chromium) {
  throw new Error("playwright chromium not found; keys=" + Object.keys(pw).join(","));
}

const STUDIO = process.env.STUDIO_URL ?? "http://127.0.0.1:4173/";
const QUESTION = "Kolik má dům pokojů? Odpověz jednou krátkou větou.";
const SAMPLE_DECISION = {
  headline: "Nejvyšší prioritu má bydlení s dětmi.",
  summary: "Rodina a rozpočet.",
  focusPriority: "family",
  secondaryPriority: "budget",
  selectedPriorities: ["family", "budget"],
  recommendations: ["Dispozice pro rodinu", "Celkové náklady"],
};

const executablePath =
  process.env.PLAYWRIGHT_CHROME_PATH ||
  "/Users/radimventus/embed-engine/.playwright-browsers/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const browser = await chromium.launch({
  headless: true,
  executablePath,
});
const page = await browser.newPage();
const consoleLines = [];
page.on("console", (msg) => {
  consoleLines.push({ type: msg.type(), text: msg.text() });
});

const result = {
  task: "PT-AI-FIX-01",
  url: STUDIO,
  timestamp: new Date().toISOString(),
};

await page.goto(STUDIO, { waitUntil: "networkidle", timeout: 60000 });

result.envAndLocal = await page.evaluate(async () => {
  const mod = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/adapter/openai/createLocalDevDelivery.ts"
  );
  const delivery = mod.tryCreateLocalDevDelivery();
  const creds = mod.detectLocalOpenAiCredentialSource();
  return {
    tryCreateLocalDevDeliveryNull: delivery === null,
    tryCreateLocalDevDeliveryId: delivery?.id ?? null,
    credentials: creds,
    viteStaticKeyPresentViaModule: creds.viteApiKey === "present",
  };
});

result.delivery = await page.evaluate(async () => {
  const mod = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/delivery/createEmbedAIDelivery.ts"
  );
  const binding = mod.resolveEmbedAIDeliveryBinding({ mode: "auto" });
  const delivery = mod.createEmbedAIDelivery({ mode: "auto" });
  return { binding, deliveryId: delivery.id };
});

result.localChat = await page.evaluate(async (payload) => {
  const question = payload.question;
  const decision = payload.decision;
  const deliveryMod = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/delivery/createEmbedAIDelivery.ts"
  );
  const svcMod = await import(
    "/@fs/Users/radimventus/embed-engine/packages/ai/src/services/AIService.ts"
  );
  const delivery = deliveryMod.createEmbedAIDelivery({ mode: "local" });
  const svc = svcMod.createAIServiceFromDelivery(delivery, {
    sessionId: "pt-ai-fix-01-browser",
  });
  const started = Date.now();
  try {
    const out = await svc.sendMessage({ message: question, decision });
    const reply = typeof out.content === "string" ? out.content : "";
    return {
      ok: reply.trim().length > 0,
      deliveryId: delivery.id,
      replySnippet: reply.trim().slice(0, 240),
      replyLen: reply.trim().length,
      ms: Date.now() - started,
    };
  } catch (e) {
    return {
      ok: false,
      deliveryId: delivery.id,
      error: {
        name: e && e.name,
        code: e && e.code,
        message: e && e.message,
        userMessage: e && e.userMessage,
      },
      ms: Date.now() - started,
    };
  }
}, { question: QUESTION, decision: SAMPLE_DECISION });

result.embedAIServiceChat = await page.evaluate(async (payload) => {
  const question = payload.question;
  const decision = payload.decision;
  try {
    const mod = await import(
      "/@fs/Users/radimventus/embed-engine/apps/client-studio/src/features/client-studio/sections/AIAdvisor/embedAIService.ts"
    );
    const started = Date.now();
    const out = await mod
      .getEmbedAIService()
      .sendMessage({ message: question, decision });
    const reply = typeof out.content === "string" ? out.content : "";
    return {
      ok: reply.trim().length > 0,
      replySnippet: reply.trim().slice(0, 240),
      replyLen: reply.trim().length,
      ms: Date.now() - started,
    };
  } catch (e) {
    return {
      ok: false,
      error: {
        name: e && e.name,
        code: e && e.code,
        message: e && e.message,
        userMessage: e && e.userMessage,
      },
    };
  }
}, { question: QUESTION, decision: SAMPLE_DECISION });

result.deliveryDiagnosticLines = [
  ...new Set(
    consoleLines.map((c) => c.text).filter((t) => t.includes("[AI Delivery]")),
  ),
];
result.consoleSample = consoleLines
  .filter((c) => /AI Delivery|OpenAI|error|Error/i.test(c.text))
  .slice(-40);

result.verdict = {
  localChat:
    result.localChat?.ok === true || result.embedAIServiceChat?.ok === true
      ? "PASS"
      : "FAIL",
  viteStaticKeyPresent:
    result.envAndLocal?.viteStaticKeyPresentViaModule === true,
  tryCreateNonNull: result.envAndLocal?.tryCreateLocalDevDeliveryNull === false,
  diagnosticPresent: result.deliveryDiagnosticLines.length > 0,
};

writeFileSync(
  resolve(__dirname, "browser-studio.json"),
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
