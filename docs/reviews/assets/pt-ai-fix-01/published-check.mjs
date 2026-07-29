/**
 * PT-AI-FIX-01 — published sterile UX in Node.
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  createEmbedAIDelivery,
  createAIServiceFromDelivery,
  resolveEmbedAIDeliveryBinding,
  ConversationError,
  mapConversationError,
  readDeliveryMeta,
} = await import(new URL("../../../../packages/ai/src/index.ts", import.meta.url).href);

const SAMPLE_DECISION = {
  headline: "Test",
  summary: "Test",
  focusPriority: "energy",
  secondaryPriority: null,
  selectedPriorities: ["energy"],
  recommendations: [],
};

const results = { task: "PT-AI-FIX-01-published", scenarios: {} };

{
  const binding = resolveEmbedAIDeliveryBinding({ mode: "published" });
  const delivery = createEmbedAIDelivery({ mode: "published" });
  let chat = null;
  try {
    const svc = createAIServiceFromDelivery(delivery, {
      sessionId: "pt-fix-published",
    });
    await svc.sendMessage({ message: "ping", decision: SAMPLE_DECISION });
    chat = { unexpectedOk: true };
  } catch (e) {
    const mapped = mapConversationError(e);
    chat = {
      code: e?.code ?? mapped.code,
      userMessage: e?.userMessage ?? mapped.userMessage,
      isConversationError: e instanceof ConversationError,
      message: e?.message,
    };
  }
  results.scenarios.publishedWithoutUrl = {
    binding,
    deliveryId: readDeliveryMeta(delivery).deliveryId,
    chat,
    uxMatches:
      typeof chat?.userMessage === "string" &&
      /AI Delivery není nakonfigurovaná/.test(chat.userMessage),
  };
}

{
  const deliveryUrl = process.env.EDGE_URL ?? "http://127.0.0.1:8799";
  let edgeHealth = null;
  try {
    const r = await fetch(`${deliveryUrl.replace(/\/$/, "")}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    edgeHealth = { ok: r.ok, status: r.status, body: await r.text().then((t) => t.slice(0, 200)) };
  } catch (e) {
    edgeHealth = { ok: false, error: String(e?.message ?? e) };
  }

  let remoteChat = null;
  if (edgeHealth.ok) {
    const delivery = createEmbedAIDelivery({ deliveryUrl });
    try {
      const svc = createAIServiceFromDelivery(delivery, {
        sessionId: "pt-fix-remote",
      });
      const out = await svc.sendMessage({
        message: "Řekni ahoj jedním slovem.",
        decision: SAMPLE_DECISION,
      });
      remoteChat = {
        deliveryId: readDeliveryMeta(delivery).deliveryId,
        ok: typeof out.content === "string" && out.content.trim().length > 0,
        replySnippet: out.content.trim().slice(0, 120),
      };
    } catch (e) {
      remoteChat = {
        ok: false,
        error: {
          code: e?.code,
          message: e?.message,
          userMessage: e?.userMessage,
        },
      };
    }
  }

  results.scenarios.publishedWithEdge = {
    deliveryUrl,
    edgeHealth,
    remoteChat,
    note: "optional",
  };
}

writeFileSync(
  resolve(__dirname, "published-check.json"),
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
