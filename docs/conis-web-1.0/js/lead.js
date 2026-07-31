/**
 * Lead capture UI — production POST to Google Apps Script (CAP-WEB-01).
 * Flow: quiz → form → Sheets + e-mail via Apps Script → thank-you.
 * Does not talk to Google Sheets directly.
 */

(function () {
  const QUESTION_TITLES_BY_KEY = Object.freeze({
    annual_sales: "Kolik domů ročně prodáváte?",
    sales_team: "Máte vlastní obchodní tým?",
    monthly_traffic: "Kolik lidí měsíčně navštíví váš web?",
    priority: "Co je pro vás důležitější?",
    ready_for_pilot: "Jste připraveni začít pilotem?",
  });

  const SEGMENT_EVALUATION = Object.freeze({
    A: Object.freeze({
      score: "Nízká připravenost",
      segment: "A — zatím není fit pro pilot",
      recommendation:
        "Pilot zatím nedává smysl. Zůstaňte v kontaktu a vraťte se, až budete připraveni začít.",
    }),
    B: Object.freeze({
      score: "Střední připravenost",
      segment: "B — ke zvážení / review",
      recommendation:
        "Potenciál je, ale potřebujeme krátké review. Ozveme se s návrhem dalšího kroku.",
    }),
    C: Object.freeze({
      score: "Vysoká připravenost",
      segment: "C — pilotní kandidát",
      recommendation:
        "Silný fit pro pilot. Domluvíme krátkou schůzku a nastavíme další postup.",
    }),
  });

  let qualificationStatus = null;
  let qualificationAnswers = null;
  let calendlyUrl = null;

  const leadSection = document.getElementById("leadSection");
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
  };

  function showLeadSection() {
    if (!leadSection) return;
    leadSection.hidden = false;
    leadSection.classList.add("is-visible");
    leadSection.style.display = "flex";
    if (leadBridge) leadBridge.hidden = false;
    if (leadFormWrap) leadFormWrap.hidden = false;
    if (leadThanks) leadThanks.hidden = true;
    if (thanksAction) thanksAction.replaceChildren();
    if (leadForm) leadForm.reset();
    hideError();
    leadSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function validate(payload) {
    if (!payload.name) return "Vyplňte prosím jméno.";
    if (!payload.company) return "Vyplňte prosím firmu.";
    if (!payload.email) return "Vyplňte prosím e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
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
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
    };
  }

  function answersByQuestionTitle(answers) {
    const mapped = {};
    Object.keys(QUESTION_TITLES_BY_KEY).forEach((key) => {
      const title = QUESTION_TITLES_BY_KEY[key];
      mapped[title] = answers && answers[key] != null ? String(answers[key]) : "";
    });
    return mapped;
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

    return "/lead";
  }

  function buildPayload(formValues) {
    const evaluation = evaluateStatus(qualificationStatus);
    const answers = qualificationAnswers || {};
    const utm = readUtmParams();

    return {
      leadId: createId(),
      timestamp: new Date().toISOString(),
      name: formValues.name,
      company: formValues.company,
      email: formValues.email,
      phone: formValues.phone,
      status: qualificationStatus || "B",
      score: evaluation.score,
      segment: evaluation.segment,
      recommendation: evaluation.recommendation,
      answers,
      answersByTitle: answersByQuestionTitle(answers),
      url: window.location.href,
      referrer: document.referrer || "",
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      sessionId: getOrCreateSessionId(),
      userAgent: navigator.userAgent,
    };
  }

  async function postLead(endpoint, payload) {
    const isAppsScript = /script\.google\.com/i.test(endpoint);
    const response = await fetch(endpoint, {
      method: "POST",
      // text/plain avoids CORS preflight against Apps Script web apps
      headers: {
        "Content-Type": isAppsScript
          ? "text/plain;charset=utf-8"
          : "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (!response.ok || body.ok === false) {
      throw new Error(
        body.error || "Odeslání se nezdařilo. Zkuste to prosím znovu.",
      );
    }

    return body;
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

    const error = validate(formValues);
    if (error) {
      showError(error);
      return;
    }

    const payload = buildPayload(formValues);
    const endpoint = resolveLeadEndpoint();

    if (leadSubmit) {
      leadSubmit.disabled = true;
      leadSubmit.textContent = "Odesílám…";
    }

    try {
      await postLead(endpoint, payload);

      if (leadFormWrap) leadFormWrap.hidden = true;
      if (leadThanks) {
        renderThanksAction();
        leadThanks.hidden = false;
        const heading = leadThanks.querySelector("h2");
        heading?.focus?.();
        leadThanks.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (err) {
      // Keep form values (do not reset) so the user can retry.
      showError(
        err instanceof Error
          ? err.message
          : "Odeslání se nezdařilo. Zkuste to prosím znovu.",
      );
    } finally {
      if (leadSubmit) {
        leadSubmit.disabled = false;
        leadSubmit.textContent = "Odeslat";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    leadForm?.addEventListener("submit", submitLead);
  });
})();
