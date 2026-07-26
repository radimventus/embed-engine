/**
 * Lead capture — separate from qualification.
 * Qualification can complete without contact.
 * Lead is created only after voluntary form submit.
 */

(function () {
  let qualificationStatus = null;
  let qualificationAnswers = null;

  const leadSection = document.getElementById("leadSection");
  const leadFormWrap = document.getElementById("leadFormWrap");
  const leadForm = document.getElementById("leadForm");
  const leadError = document.getElementById("leadError");
  const leadThanks = document.getElementById("leadThanks");
  const leadSubmit = document.getElementById("leadSubmit");

  window.ConisLead = {
    prepare(status, answers) {
      qualificationStatus = status;
      qualificationAnswers = { ...answers };
      showLeadSection();
    }
  };

  function showLeadSection() {
    if (!leadSection) return;
    leadSection.hidden = false;
    leadSection.classList.add("is-visible");
    leadSection.style.display = "flex";
    if (leadFormWrap) leadFormWrap.hidden = false;
    if (leadThanks) leadThanks.hidden = true;
    if (leadForm) leadForm.reset();
    hideError();
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
