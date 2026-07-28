/**
 * Lead capture UI — posts to leadService via POST /lead.
 * Flow: quiz → form → single thank-you.
 */

(function () {
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
    }
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

  async function submitLead(event) {
    event.preventDefault();
    hideError();

    if (!leadForm) return;

    const data = new FormData(leadForm);
    const payload = {
      name: String(data.get("name") || "").trim(),
      company: String(data.get("company") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      status: qualificationStatus,
      answers: qualificationAnswers || {},
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    const error = validate(payload);
    if (error) {
      showError(error);
      return;
    }

    if (leadSubmit) {
      leadSubmit.disabled = true;
      leadSubmit.textContent = "Odesílám…";
    }

    try {
      const response = await fetch("/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Odeslání se nezdařilo.");
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
          : "Odeslání se nezdařilo. Zkuste to prosím znovu."
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
