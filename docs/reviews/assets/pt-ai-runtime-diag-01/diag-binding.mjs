/**
 * Binding / UX / NotConfigured diagnostics (no product code changes).
 * Run: pnpm --filter @embed-engine/ai exec node --import tsx ../../docs/reviews/assets/pt-ai-runtime-diag-01/diag-binding.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../../..");

function loadDotEnvLocal() {
  const path = resolve(repoRoot, ".env.local");
  const out = {};
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
  } catch (e) {
    out.__error = String(e);
  }
  return out;
}

const results = {
  task: "binding-resolution",
  scenarios: {},
};

const {
  resolveEmbedAIDeliveryBinding,
  createEmbedAIDelivery,
  tryCreateLocalDevDelivery,
  createAIServiceFromDelivery,
  ConversationError,
  mapConversationError,
} = await import("@embed-engine/ai");

// --- Scenario A: published sterile (no url, no process key for local) ---
{
  const savedOpenAI = process.env.OPENAI_API_KEY;
  const savedVite = process.env.VITE_OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.VITE_OPENAI_API_KEY;
  // import.meta.env in node/tsx typically undefined or empty for VITE_*
  const binding = resolveEmbedAIDeliveryBinding({ mode: "auto" });
  const delivery = createEmbedAIDelivery({ mode: "auto" });
  let chatError = null;
  try {
    const svc = createAIServiceFromDelivery(delivery, { sessionId: "diag-sterile" });
    await svc.sendMessage({ text: "ahoj" });
  } catch (e) {
    chatError = {
      name: e?.name,
      code: e?.code,
      message: e?.message,
      userMessage: e?.userMessage,
      isConversationError: e instanceof ConversationError,
      mapped: (() => {
        const m = mapConversationError(e);
        return { code: m.code, userMessage: m.userMessage, name: m.name };
      })(),
    };
  }
  results.scenarios.publishedSterileAuto = {
    note: "auto with no deliveryUrl → mode local → tryCreateLocal → NotConfigured",
    binding,
    deliveryId: delivery.id,
    importMetaEnvKeys:
      typeof import.meta.env === "object" && import.meta.env
        ? Object.keys(import.meta.env)
        : null,
    chatError,
  };
  if (savedOpenAI !== undefined) process.env.OPENAI_API_KEY = savedOpenAI;
  else delete process.env.OPENAI_API_KEY;
  if (savedVite !== undefined) process.env.VITE_OPENAI_API_KEY = savedVite;
  else delete process.env.VITE_OPENAI_API_KEY;
}

// --- Scenario B: local force mode + process.env from .env.local ---
{
  const dotenv = loadDotEnvLocal();
  const key = dotenv.VITE_OPENAI_API_KEY || dotenv.OPENAI_API_KEY || "";
  const model = dotenv.VITE_OPENAI_MODEL || dotenv.OPENAI_MODEL || "";
  results.scenarios.envLocalFile = {
    hasViteKey: key.length > 0,
    viteKeyLen: key.length,
    model: model || null,
    hasOpenAIKeyInFile: Boolean(dotenv.OPENAI_API_KEY),
  };

  // Only OPENAI_API_KEY (what tryCreateLocalDevDelivery reads via process.env)
  delete process.env.VITE_OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = key;
  if (model) process.env.OPENAI_MODEL = model;

  const bindingLocal = resolveEmbedAIDeliveryBinding({ mode: "local" });
  const localTry = tryCreateLocalDevDelivery();
  const deliveryForced = createEmbedAIDelivery({ mode: "local" });

  let chatOk = null;
  let chatErr = null;
  try {
    const svc = createAIServiceFromDelivery(deliveryForced, { sessionId: "diag-local" });
    // Don't actually call OpenAI here — just prove delivery constructed
    chatOk = {
      deliveryId: deliveryForced.id,
      localTryId: localTry?.id ?? null,
      localTryNull: localTry === null,
      processEnvOpenAILen: (process.env.OPENAI_API_KEY || "").length,
      processEnvViteLen: (process.env.VITE_OPENAI_API_KEY || "").length,
      note: "key resolves via process.env.OPENAI_API_KEY when set; VITE_* via import.meta.env only",
    };
  } catch (e) {
    chatErr = { name: e?.name, message: e?.message };
  }

  // Also: without OPENAI_API_KEY, only VITE in process.env (should FAIL for process path)
  delete process.env.OPENAI_API_KEY;
  process.env.VITE_OPENAI_API_KEY = key;
  const localTryViteOnlyInProcess = tryCreateLocalDevDelivery();

  results.scenarios.localWithProcessEnv = {
    binding: bindingLocal,
    deliveryId: deliveryForced.id,
    tryCreateLocalDevDeliveryId: localTry?.id ?? null,
    tryCreateNull: localTry === null,
    chatOk,
    chatErr,
    viteKeyOnlyInProcessEnv_tryCreate: {
      null: localTryViteOnlyInProcess === null,
      id: localTryViteOnlyInProcess?.id ?? null,
      note: "readProcessEnv only checks OPENAI_API_KEY not VITE_OPENAI_API_KEY; readViteEnv uses import.meta.env",
    },
  };
}

// --- Scenario C: NotConfigured via createAIServiceFromDelivery userMessage ---
{
  const delivery = createEmbedAIDelivery({ mode: "disabled" });
  let err = null;
  try {
    const svc = createAIServiceFromDelivery(delivery, { sessionId: "diag-disabled" });
    await svc.sendMessage({ text: "ping" });
  } catch (e) {
    err = {
      instanceofConversationError: e instanceof ConversationError,
      code: e?.code,
      userMessage: e?.userMessage,
      message: e?.message,
    };
  }
  results.scenarios.notConfiguredChat = {
    deliveryId: delivery.id,
    error: err,
  };
}

// --- Scenario D: non-ConversationError → AIAdvisor fallback string ---
{
  const FALLBACK = "Došlo k chybě při generování odpovědi. Zkuste to prosím znovu.";
  const raw = new Error("boom-raw");
  const mapped = mapConversationError(raw);
  // Simulate AIAdvisor catch:
  function advisorUserMessage(error) {
    return error instanceof ConversationError
      ? error.userMessage
      : FALLBACK;
  }
  results.scenarios.aiAdvisorFallback = {
    rawError_advisorShows: advisorUserMessage(raw),
    rawError_isFallback: advisorUserMessage(raw) === FALLBACK,
    mapped_instanceof: mapped instanceof ConversationError,
    mapped_advisorShows: advisorUserMessage(mapped),
    mapped_code: mapped.code,
    mapped_userMessage: mapped.userMessage,
    note: "If UI imports ConversationError from a different module instance than AIService throws, instanceof fails → FALLBACK",
  };
}

// --- Scenario E: import.meta.env dynamic access in node ---
{
  results.scenarios.importMetaEnvNode = {
    hasImportMetaEnv: typeof import.meta.env !== "undefined",
    type: typeof import.meta.env,
    keys:
      typeof import.meta.env === "object" && import.meta.env
        ? Object.keys(import.meta.env)
        : [],
    dynamicViteKeyType: typeof import.meta.env?.["VITE_OPENAI_API_KEY"],
    dynamicViteKeyLen:
      typeof import.meta.env?.["VITE_OPENAI_API_KEY"] === "string"
        ? import.meta.env["VITE_OPENAI_API_KEY"].length
        : 0,
  };
}

console.log(JSON.stringify(results, null, 2));
