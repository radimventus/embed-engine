/**
 * CONIS commercial dialog — partner-centered (Booklet WEB-2.0).
 * Gold marks partner-value lines only.
 */

const questions = [
  {
    key: "extra_homes",
    title: [
      "Představte si, že by váš současný web přiváděl více připravených zájemců.",
      { text: "Kolik nových domů byste chtěli ročně prodat navíc?", gold: true }
    ],
    answers: ["do 5", "5–15", "15–40", "více než 40"]
  },
  {
    key: "decision_pain",
    title: "Kde dnes nejčastěji ztrácíte čas v prodeji?",
    answers: [
      "Vysvětlováním produktu",
      "Porovnáváním s konkurencí",
      "Čekáním na rozhodnutí",
      "Nejistotou zákazníka"
    ]
  },
  {
    key: "understanding",
    title: "Když zákazník poprvé zavolá, jak dobře už rozumí vašemu domu?",
    answers: ["Skoro vůbec", "Částečně", "Dobře", "Velmi dobře"]
  },
  {
    key: "cycle_value",
    title: [
      "Co by pro vás znamenalo zkrácení prodejního cyklu?"
    ],
    answers: [
      "Více uzavřených obchodů",
      "Méně ztracených zájemců",
      "Klidnější obchodní tým",
      "Všechny tři"
    ]
  },
  {
    key: "want_consult",
    title: [
      "Chcete ověřit, jestli to dává smysl u vás?",
      { text: "Na jednom domě?", gold: true }
    ],
    answers: ["Ano, chci konzultaci", "Zatím jen přemýšlím"]
  }
];

let current = 0;
const userAnswers = {};

const titleEl = document.getElementById("questionTitle");
const answersEl = document.getElementById("answers");
const progressEl = document.getElementById("progressBar");
const progressTrack = document.getElementById("progressTrack");
const quizContainer = document.getElementById("quizContainer");

function normalizeTitleLines(title) {
  const raw = Array.isArray(title) ? title : [title];
  return raw.map((line) => {
    if (typeof line === "string") {
      return { text: line, gold: false };
    }
    return { text: String(line.text || ""), gold: Boolean(line.gold) };
  });
}

function renderQuestionTitle(title) {
  if (!titleEl) return;
  titleEl.replaceChildren();

  normalizeTitleLines(title).forEach((line, index) => {
    if (index > 0) {
      titleEl.appendChild(document.createElement("br"));
    }
    if (line.gold) {
      const mark = document.createElement("span");
      mark.className = "gold";
      mark.textContent = line.text;
      titleEl.appendChild(mark);
    } else {
      titleEl.appendChild(document.createTextNode(line.text));
    }
  });
}

function render() {
  if (!titleEl || !answersEl) return;

  const currentQ = questions[current];
  renderQuestionTitle(currentQ.title);
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
    finishDialog();
  }
}

function resolveStatus() {
  return userAnswers.want_consult === "Ano, chci konzultaci" ? "C" : "B";
}

function finishDialog() {
  if (quizContainer) quizContainer.style.display = "none";
  document.getElementById("zjistit-potencial")?.classList.add("is-complete");

  const status = resolveStatus();

  if (window.ConisLead && typeof window.ConisLead.prepare === "function") {
    window.ConisLead.prepare(status, userAnswers, { calendlyUrl: null });
  }
}

document.addEventListener("DOMContentLoaded", render);
