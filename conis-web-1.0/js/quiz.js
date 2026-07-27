/**
 * CONIS Qualification Engine
 * Sends answers to POST /qualification (server decides A/B/C).
 * After quiz → contact form (no intermediate thank-you).
 */

const questions = [
  {
    key: "annual_sales",
    title: "Kolik domů ročně prodáváte?",
    answers: ["do 20", "20–100", "100–300", "více než 300"]
  },
  {
    key: "sales_team",
    title: "Máte vlastní obchodní tým?",
    answers: ["Ano", "Ne"]
  },
  {
    key: "monthly_traffic",
    title: "Kolik lidí měsíčně navštíví váš web?",
    answers: ["do 500", "500–2 000", "2 000–10 000", "více"]
  },
  {
    key: "priority",
    title: "Co je pro vás důležitější?",
    answers: ["Více poptávek", "Lepší rozhodování zákazníků"]
  },
  {
    key: "ready_for_pilot",
    title: "Jste připraveni začít pilotem?",
    answers: ["Ano", "Ne"]
  }
];

let current = 0;
const userAnswers = {};

const titleEl = document.getElementById("questionTitle");
const answersEl = document.getElementById("answers");
const progressEl = document.getElementById("progressBar");
const progressTrack = document.getElementById("progressTrack");
const quizContainer = document.getElementById("quizContainer");

function render() {
  if (!titleEl || !answersEl) return;

  const currentQ = questions[current];
  titleEl.textContent = currentQ.title;
  answersEl.replaceChildren();

  currentQ.answers.forEach((answerText, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.textContent = answerText;
    button.setAttribute("data-answer-index", String(index));
    button.addEventListener("click", () => {
      selectAnswer(currentQ.key, answerText);
    });
    answersEl.appendChild(button);
  });

  if (progressEl) {
    progressEl.style.width = ((current + 1) / questions.length) * 100 + "%";
  }

  if (progressTrack) {
    progressTrack.setAttribute("aria-valuenow", String(current + 1));
    progressTrack.setAttribute("aria-valuemax", String(questions.length));
  }

  const firstAnswer = answersEl.querySelector(".answer");
  if (firstAnswer && current > 0) {
    firstAnswer.focus();
  }
}

function selectAnswer(key, value) {
  userAnswers[key] = value;
  current++;

  if (current < questions.length) {
    render();
  } else {
    submitQualification();
  }
}

function safeUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href;
    }
  } catch {
    /* ignore */
  }
  return "https://calendly.com/conis/rezervace-schuzky";
}

async function submitQualification() {
  if (quizContainer) quizContainer.style.display = "none";
  document.getElementById("closing")?.classList.add("is-complete");

  let status = "B";
  let calendlyUrl = null;

  try {
    const response = await fetch("/qualification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userAnswers)
    });

    if (response.ok) {
      const data = await response.json();
      status = data.status || "B";
      calendlyUrl = data.calendlyUrl || null;
    }
  } catch (error) {
    console.warn("Backend unavailable, using default review status.", error);
  }

  if (window.ConisLead && typeof window.ConisLead.prepare === "function") {
    window.ConisLead.prepare(status, userAnswers, {
      calendlyUrl: calendlyUrl ? safeUrl(calendlyUrl) : null
    });
  }
}

document.addEventListener("DOMContentLoaded", render);
