/**
 * Lead capture UI — consultation request (WEB-2.0).
 * Builds LeadPayload and submits via @embed-engine/lead (IIFE).
 */

(function () {
  const QUESTION_TITLES_BY_KEY = Object.freeze({
    extra_homes:
      "Kolik nových domů byste chtěli ročně prodat navíc (při více připravených zájemcích)?",
    decision_pain: "Kde dnes nejčastěji ztrácíte čas v prodeji?",
    understanding:
      "Když zákazník poprvé zavolá, jak dobře už rozumí vašemu domu?",
    cycle_value: "Co by pro vás znamenalo zkrácení prodejního cyklu?",
    want_consult:
      "Chcete ověřit, jestli to dává smysl u vás — na jednom domě?",
  });

  const SEGMENT_EVALUATION = Object.freeze({
    A: Object.freeze({
      score: 1,
      segment: "A — zatím není fit",
      recommendation: "Zatím jen přemýšlí — zůstat v kontaktu.",
    }),
    B: Object.freeze({
      score: 2,
      segment: "B — ke konzultaci / review",
      recommendation: "Ozveme se a domluvíme další krok.",
    }),
    C: Object.freeze({
      score: 3,
      segment: "C — žádost o konzultaci",
      recommendation: "Partner chce konzultaci — kontaktovat.",
    }),
  });

  let qualificationStatus = null;
  let qualificationAnswers = null;
  let calendlyUrl = null;
  let leadService = null;

  const leadCapture = document.getElementById("registrace");
  const leadFormWrap = document.getElementById("leadFormWrap");
  const leadForm = document.getElementById("leadForm");
  const leadError = document.getElementById("leadError");
  const leadThanks = document.getElementById("leadThanks");
  const leadSubmit = document.getElementById("leadSubmit");
  const leadBridge = document.getElementById("leadBridge");
  const thanksAction = document.getElementById("thanksAction");

  window.ConisLead = {
    prepare(status, answers, options = {}) {
      qualificationStatus = status;
      qualificationAnswers = { ...answers };
      calendlyUrl = options.calendlyUrl || null;
      showLeadSection();
    },
    /** Nav "Registrovat" — consultation request without dialog. */
    openConsultation() {
      qualificationStatus = qualificationStatus || "B";
      qualificationAnswers = qualificationAnswers || {};
      calendlyUrl = null;
      showLeadSection();
    },
  };

  function showLeadSection() {
    if (!leadCapture) return;
    leadCapture.hidden = false;
    leadCapture.removeAttribute("hidden");
    leadCapture.classList.add("is-visible");
    if (leadBridge) leadBridge.hidden = false;
    if (leadFormWrap) leadFormWrap.hidden = false;
    if (leadThanks) leadThanks.hidden = true;
    if (thanksAction) thanksAction.replaceChildren();
    if (leadForm) leadForm.reset();
    hideError();
    leadCapture.scrollIntoView({ behavior: "smooth", block: "start" });
    leadForm?.querySelector("input")?.focus?.();
  }

  function hideError() {
    if (!leadError) return;
    leadError.hidden = true;
    leadError.textContent = "";
  }

  function showError(message) {
    if (!leadError) return;
    leadError.hidden = false;
    leadError.textContent = message;
  }

  function validateContact(formValues) {
    if (!formValues.company) return "Vyplňte prosím firmu.";
    if (!formValues.name) return "Vyplňte prosím jméno.";
    if (!formValues.phone) return "Vyplňte prosím telefon.";
    if (!formValues.email) return "Vyplňte prosím e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      return "Zadejte platný e-mail.";
    }
    return null;
  }

  function renderThanksAction() {
    if (!thanksAction) return;
    thanksAction.replaceChildren();
    if (qualificationStatus !== "C" || !calendlyUrl) return;

    const link = document.createElement("a");
    link.href = calendlyUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "cta-button";
    link.textContent = "Rezervovat online schůzku";
    thanksAction.appendChild(link);
  }

  function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getOrCreateSessionId() {
    const key = "conis_quiz_session_id";
    try {
      const existing = sessionStorage.getItem(key);
      if (existing) return existing;
      const next = createId();
      sessionStorage.setItem(key, next);
      return next;
    } catch {
      return createId();
    }
  }

  function readUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("utm_source") || undefined,
      medium: params.get("utm_medium") || undefined,
      campaign: params.get("utm_campaign") || undefined,
      term: params.get("utm_term") || undefined,
      content: params.get("utm_content") || undefined,
    };
  }

  function evaluateStatus(status) {
    const code = String(status || "B").toUpperCase();
    return SEGMENT_EVALUATION[code] || SEGMENT_EVALUATION.B;
  }

  function resolveLeadEndpoint() {
    const fromWindow =
      typeof window.CONIS_LEAD_ENDPOINT === "string"
        ? window.CONIS_LEAD_ENDPOINT.trim()
        : "";
    if (fromWindow) return fromWindow;

    const meta = document.querySelector('meta[name="conis-lead-endpoint"]');
    const fromMeta = meta?.getAttribute("content")?.trim() || "";
    if (fromMeta) return fromMeta;

    return "";
  }

  function ensureLeadService() {
    if (leadService) return leadService;
    const api = window.EmbedLead;
    if (!api || typeof api.createLeadService !== "function") {
      throw new Error("Lead Service není načtená (chybí lead.iife.js).");
    }
    const endpoint = resolveLeadEndpoint();
    if (!endpoint) {
      throw new Error("Lead endpoint není nakonfigurován.");
    }
    leadService = api.createLeadService({ endpoint });
    return leadService;
  }

  function buildLeadPayload(formValues) {
    const answers = qualificationAnswers || {};
    const evaluation = evaluateStatus(qualificationStatus);
    const source =
      (window.EmbedLead && window.EmbedLead.LEAD_SOURCES?.CONIS_WEB) ||
      "CONIS_WEB";

    const fields = Object.keys(QUESTION_TITLES_BY_KEY).map((key) => ({
      id: key,
      label: QUESTION_TITLES_BY_KEY[key],
      value: answers[key] != null ? String(answers[key]) : "",
    }));

    const utm = readUtmParams();

    return {
      source,
      leadId: createId(),
      timestamp: new Date().toISOString(),
      contact: {
        name: formValues.name,
        company: formValues.company,
        email: formValues.email,
        phone: formValues.phone,
      },
      fields,
      summary: {
        score: evaluation.score,
        segment: evaluation.segment,
        recommendation: evaluation.recommendation,
      },
      metadata: {
        url: window.location.href,
        referrer: document.referrer || undefined,
        sessionId: getOrCreateSessionId(),
        utm,
      },
    };
  }

  async function submitLead(event) {
    event.preventDefault();
    hideError();

    if (!leadForm) return;

    const data = new FormData(leadForm);
    const formValues = {
      name: String(data.get("name") || "").trim(),
      company: String(data.get("company") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
    };

    const error = validateContact(formValues);
    if (error) {
      showError(error);
      return;
    }

    if (leadSubmit) {
      leadSubmit.disabled = true;
      leadSubmit.textContent = "Odesílám…";
    }

    try {
      const service = ensureLeadService();
      const payload = buildLeadPayload(formValues);
      const result = await service.submitLead(payload);

      if (!result.ok) {
        throw new Error(
          result.error || "Odeslání se nezdařilo. Zkuste to prosím znovu.",
        );
      }

      if (leadFormWrap) leadFormWrap.hidden = true;
      if (leadThanks) {
        renderThanksAction();
        leadThanks.hidden = false;
        const heading = leadThanks.querySelector("h2");
        heading?.focus?.();
        leadThanks.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Odeslání se nezdařilo. Zkuste to prosím znovu.",
      );
    } finally {
      if (leadSubmit) {
        leadSubmit.disabled = false;
        leadSubmit.textContent = "Odeslat žádost";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    leadForm?.addEventListener("submit", submitLead);

    const openFromHash = () => {
      const hash = (window.location.hash || "").toLowerCase();
      if (hash === "#registrace" || hash === "#leadsection") {
        window.ConisLead.openConsultation();
      }
    };
    document.getElementById("navRegister")?.addEventListener("click", (event) => {
      event.preventDefault();
      history.replaceState(null, "", "#registrace");
      window.ConisLead.openConsultation();
    });
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  });
})();
