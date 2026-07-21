const U = {
  selectedPriorityIds: [],
  dominantPriorityId: ""
};
function I(e) {
  return {
    object: e,
    stage: "Selection",
    selection: U,
    confirmation: null,
    transitionMessage: null,
    interpretation: null,
    experience: null,
    houseMapping: null,
    followUps: null,
    completed: !1
  };
}
function _(e) {
  return e.completed;
}
function b(e) {
  return e.selectedPriorityIds.length > 0 && e.dominantPriorityId.length > 0 && e.selectedPriorityIds.includes(e.dominantPriorityId);
}
function E(e) {
  return e.confirmation !== null && e.confirmation.accepted;
}
function L(e) {
  return e.experience !== null;
}
function O(e) {
  return e.houseMapping !== null && e.houseMapping.entries.length > 0;
}
function s(e, t, o, n) {
  return {
    ok: !1,
    state: e,
    error: {
      code: o,
      message: n,
      stage: e.stage,
      event: t
    }
  };
}
function A() {
  return {
    confirmation: null,
    transitionMessage: null,
    interpretation: null,
    experience: null,
    houseMapping: null,
    followUps: null,
    completed: !1
  };
}
function x(e, t, o) {
  return {
    ok: !0,
    state: {
      ...e,
      ...A(),
      stage: t,
      selection: o
    },
    emitted: ["priority.context.invalidated"]
  };
}
function $(e, t) {
  if (_(e) && t.type !== "priority.selection.changed")
    return s(
      e,
      t.type,
      "JOURNEY_ALREADY_COMPLETED",
      "Journey is complete; only selection change (new run) or reset is allowed"
    );
  switch (t.type) {
    case "priority.selection.changed": {
      const o = t.selection, n = b(o) ? "Confirmation" : "Selection";
      return x(e, n, o);
    }
    case "priority.confirmation.edit":
      return e.stage !== "Confirmation" && e.stage !== "Transition" ? s(
        e,
        t.type,
        "INVALID_TRANSITION",
        "confirmation.edit is only valid from Confirmation (or Transition before Interpretation)"
      ) : {
        ok: !0,
        state: {
          ...e,
          ...A(),
          stage: "Selection"
        },
        emitted: []
      };
    case "priority.confirmation.accepted": {
      if (e.stage !== "Confirmation")
        return s(
          e,
          t.type,
          "INVALID_TRANSITION",
          "confirmation.accepted requires Confirmation stage"
        );
      if (!b(e.selection))
        return s(
          e,
          t.type,
          "GUARD_FAILED",
          "confirmation.accepted requires a non-empty Priority Selection"
        );
      const o = {
        selectionSnapshot: e.selection,
        accepted: !0,
        presentationPayload: t.presentationPayload
      };
      return {
        ok: !0,
        state: {
          ...e,
          confirmation: o,
          stage: "Transition",
          completed: !1
        },
        emitted: []
      };
    }
    case "priority.transition.completed":
      return e.stage !== "Transition" ? s(
        e,
        t.type,
        "INVALID_TRANSITION",
        "transition.completed requires Transition stage"
      ) : E(e) ? {
        ok: !0,
        state: {
          ...e,
          transitionMessage: t.transitionMessage ?? e.transitionMessage,
          stage: "Interpretation"
        },
        emitted: []
      } : s(
        e,
        t.type,
        "GUARD_FAILED",
        "transition.completed requires prior Confirmation"
      );
    case "priority.interpretation.ready":
      return e.stage !== "Interpretation" ? s(
        e,
        t.type,
        "INVALID_TRANSITION",
        "interpretation.ready requires Interpretation stage"
      ) : E(e) ? {
        ok: !0,
        state: {
          ...e,
          interpretation: t.interpretation,
          experience: t.experience,
          houseMapping: null,
          followUps: null,
          stage: "Interpretation"
        },
        emitted: []
      } : s(
        e,
        t.type,
        "GUARD_FAILED",
        "interpretation.ready must not fire before confirmation.accepted"
      );
    case "priority.mapping.ready":
      return e.stage !== "Interpretation" && e.stage !== "HouseMapping" ? s(
        e,
        t.type,
        "INVALID_TRANSITION",
        "mapping.ready requires Interpretation (with Experience) or HouseMapping stage"
      ) : L(e) ? t.houseMapping.entries.length === 0 ? s(
        e,
        t.type,
        "GUARD_FAILED",
        "mapping.ready requires a non-empty House Mapping set"
      ) : t.followUps.length === 0 ? s(
        e,
        t.type,
        "GUARD_FAILED",
        "Follow-up requires at least one handoff when Mapping completes"
      ) : {
        ok: !0,
        state: {
          ...e,
          houseMapping: t.houseMapping,
          followUps: t.followUps,
          stage: "HouseMapping"
        },
        emitted: []
      } : s(
        e,
        t.type,
        "GUARD_FAILED",
        "mapping.ready must not fire before interpretation.ready (Experience required)"
      );
    case "priority.followup.selected":
      return e.stage !== "HouseMapping" && e.stage !== "FollowUp" ? s(
        e,
        t.type,
        "INVALID_TRANSITION",
        "followup.selected requires HouseMapping or FollowUp stage"
      ) : O(e) ? (e.followUps ?? []).some((n) => n.targetId === t.targetId) ? {
        ok: !0,
        state: {
          ...e,
          stage: "FollowUp",
          completed: !0
        },
        emitted: []
      } : s(
        e,
        t.type,
        "GUARD_FAILED",
        "followup.selected targetId must be one of the exposed handoffs"
      ) : s(
        e,
        t.type,
        "GUARD_FAILED",
        "followup.selected requires House Mapping to be ready"
      );
    case "priority.context.invalidated": {
      const o = b(e.selection) ? "Confirmation" : "Selection";
      return x(e, o, e.selection);
    }
    default:
      return s(
        e,
        t.type,
        "INVALID_TRANSITION",
        "Unknown event"
      );
  }
}
function C(e) {
  let t = I({ objectId: e });
  return {
    getState() {
      return t;
    },
    isComplete() {
      return _(t);
    },
    reset() {
      return t = I(t.object), t;
    },
    dispatch(o) {
      const n = $(t, o);
      return n.ok && (t = n.state), n;
    }
  };
}
const f = "garden", g = "house-modern-01", y = {
  stageMicrocopy: {
    confirmation: {
      title: "Zahrada je pro vás podstatná",
      body: `Podle vašeho výběru budeme dům číst hlavně podle toho, jak se bydlí venku a jak je dům s venkovním prostorem propojený.

Ještě nehodnotíme, jestli je dům „ideální“.
Nejdřív potvrďte, že toto je opravdu váš důraz.`,
      primaryAction: "Potvrdit a pokračovat",
      secondaryAction: "Upravit priority"
    },
    transition: "Teď se podíváme na dům vaší optikou zahrady — co venkovní život v tomto objektu podporuje a na co si dát pozor."
  }
}, h = {
  selectedPriorityIds: [f],
  dominantPriorityId: f
}, z = {
  id: "mock-interpretation-garden-house-modern-01",
  objectId: g,
  priorityIds: [f],
  strengths: [
    {
      id: "str-outdoor-daily",
      code: "OUTDOOR_DAILY_LIFE",
      weight: 0.82
    },
    {
      id: "str-day-zone-open",
      code: "DAY_ZONE_OUTDOOR_POTENTIAL",
      weight: 0.78
    },
    {
      id: "str-privacy-lot",
      code: "LOT_PRIVACY_POTENTIAL",
      weight: 0.7
    }
  ],
  frictions: [
    {
      id: "fri-garden-variability",
      code: "GARDEN_QUALITY_VARIABLE",
      weight: 0.55
    },
    {
      id: "fri-access-levels",
      code: "OUTDOOR_ACCESS_LEVEL_CHECK",
      weight: 0.5
    }
  ],
  opportunities: [
    {
      id: "opp-verify-threshold",
      code: "VERIFY_DAY_ZONE_THRESHOLD",
      weight: 0.75
    }
  ],
  tradeOffs: [
    {
      id: "to-garden-vs-layout",
      code: "GARDEN_VS_INTERNAL_LAYOUT",
      favors: "OUTDOOR_DAILY_LIFE",
      against: "INTERNAL_LAYOUT_INDEPENDENT"
    }
  ],
  confidenceInputs: [
    {
      id: "ci-priority",
      code: "PRIORITY_LENS_GARDEN",
      contribution: 0.4
    },
    {
      id: "ci-object-basics",
      code: "OBJECT_BASIC_FACTS",
      contribution: 0.35
    },
    {
      id: "ci-usage-unknown",
      code: "USAGE_PREFERENCE_UNKNOWN",
      contribution: -0.15
    }
  ],
  matchScore: 62,
  recommendedIntent: "VERIFY_HOUSE_GARDEN_THRESHOLD"
}, j = {
  id: "mock-experience-garden-house-modern-01",
  title: "Čtení domu přes zahradu",
  summary: "Podle vaší priority Zahrada se tento dům čte jako objekt, kde venkovní prostor není jen „něco navíc“, ale součást každodenního bydlení — pokud sedí propojení denní zóny s venkem a charakter pozemku.",
  focus: [
    "vztah domu k venkovnímu prostoru",
    "propojení denní zóny ven",
    "soukromí na pozemku"
  ],
  evidence: [
    {
      id: "ev-outdoor-relation",
      title: "Vztah k venkovnímu prostoru",
      description: "Dům nabízí vztah k venkovnímu prostoru, který lze číst jako součást denního života."
    },
    {
      id: "ev-day-zone",
      title: "Denní zóna a východ ven",
      description: "Denní zóna má potenciál otevřít se ven — posezení a pohyb venku pak dávají smysl."
    },
    {
      id: "ev-privacy-lot",
      title: "Soukromí mimo ulici",
      description: "Zahrada / pozemek dává prostor soukromí mimo ulici — pokud to dispozice a okolí podporují."
    }
  ],
  concerns: [
    {
      id: "co-garden-not-equal",
      title: "Ne každá zahrada znamená stejný život venku",
      description: "Záleží na velikosti, soukromí a dostupnosti z domu.",
      severity: "medium"
    },
    {
      id: "co-verify-access",
      title: "Ověřit východ a výškové rozdíly",
      description: "Pokud je klíčové přímé propojení obývacího prostoru ven, ověřte konkrétní východ a výškové rozdíly.",
      severity: "medium"
    },
    {
      id: "co-layout-not-solved",
      title: "Zahrada neřeší dispozici uvnitř",
      description: "Zahrada jen mění, co je při prohlídce důležité — neřeší sama o sobě vnitřní uspořádání.",
      severity: "low"
    }
  ],
  confidence: {
    level: "medium",
    score: 62,
    explanation: "Střední — opírá se o vybranou prioritu a základní fakta domu; ještě neznáme vaši přesnou představu o velikosti a způsobu užívání zahrady."
  },
  recommendations: [
    "Prohlédněte místa, kde dům potkává zahradu — denní zónu a východ ven."
  ],
  actions: [
    {
      id: "act-map-threshold",
      label: "Podívat se na místa dům ↔ zahrada",
      type: "primary",
      intent: "explore"
    },
    {
      id: "act-review-reading",
      label: "Vrátit se k interpretační kartě",
      type: "secondary",
      intent: "explore"
    }
  ]
}, R = {
  text: y.stageMicrocopy.transition
}, T = {
  object: { objectId: g },
  entries: [
    {
      claimRef: { claimId: "ev-day-zone" },
      objectAnchor: { kind: "zone", id: "day-zone-outdoor-exit" },
      why: "Ukazuje, jestli je venkovní život součástí dne, nebo oddělený „na konci domu“."
    },
    {
      claimRef: { claimId: "ev-outdoor-relation" },
      objectAnchor: { kind: "element", id: "terrace-threshold" },
      why: "Posezení a prah mezi interiérem a zahradou — praktický střed zahradního bydlení."
    },
    {
      claimRef: { claimId: "ev-privacy-lot" },
      objectAnchor: { kind: "zone", id: "garden-lot" },
      why: "Dává měřítko: je venku kam jít, hrát si, sedět, mít klid."
    },
    {
      claimRef: { claimId: "co-garden-not-equal" },
      objectAnchor: { kind: "relation", id: "street-neighbor-privacy" },
      why: "Zahrada bez soukromí často nesplní motivaci „vlastní venku“."
    },
    {
      claimRef: { claimId: "ev-outdoor-relation" },
      objectAnchor: { kind: "medium", id: "interior-green-view" },
      why: "Posiluje čtení, že zahrada patří k atmosféře bydlení, ne jen k pozemku."
    }
  ]
}, M = [
  {
    targetId: "tour-day-zone",
    label: "Prohlídka denní zóny"
  },
  {
    targetId: "media-exterior-garden",
    label: "Média exteriér / zahrada"
  },
  {
    targetId: "decision-terminal",
    label: "Decision Terminal / Experience shrnutí"
  }
], F = "tour-day-zone";
function H() {
  return {
    selectionSnapshot: h,
    accepted: !0,
    presentationPayload: y.stageMicrocopy.confirmation
  };
}
function G() {
  return {
    object: { objectId: g },
    stage: "FollowUp",
    selection: h,
    confirmation: H(),
    transitionMessage: R,
    interpretation: z,
    experience: j,
    houseMapping: T,
    followUps: M
  };
}
function q() {
  return [
    {
      type: "priority.selection.changed",
      selection: h
    },
    {
      type: "priority.confirmation.accepted",
      presentationPayload: y.stageMicrocopy.confirmation
    },
    {
      type: "priority.transition.completed",
      transitionMessage: R
    },
    {
      type: "priority.interpretation.ready",
      interpretation: z,
      experience: j
    },
    {
      type: "priority.mapping.ready",
      houseMapping: T,
      followUps: M
    },
    {
      type: "priority.followup.selected",
      targetId: F
    }
  ];
}
function r(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function J(e) {
  return r(e).replaceAll(`
`, "<br />");
}
const V = {
  Selection: "Selection",
  Confirmation: "Confirmation",
  Transition: "Transition",
  Interpretation: "Interpretation",
  HouseMapping: "House Mapping",
  FollowUp: "Follow-up"
};
function Y(e) {
  return `<ol class="stage-rail" aria-label="Journey stages">${[
    "Selection",
    "Confirmation",
    "Transition",
    "Interpretation",
    "HouseMapping",
    "FollowUp"
  ].map((n) => `<li class="stage-rail__item${n === e ? " is-active" : ""}">${r(V[n])}</li>`).join("")}</ol>`;
}
function Z(e) {
  const t = e.selection.dominantPriorityId;
  return `
    <section class="panel" data-stage="Selection">
      <p class="eyebrow">Priority Selection</p>
      <h2>Co je pro vás podstatné?</h2>
      <p class="lede">Zvolte čočku. Renderer nic nevyhodnocuje — jen předá výběr Runtime Engine.</p>
      <button type="button" class="btn btn-primary" data-action="select-garden">
        Zvolit prioritu: ${r(t)}
      </button>
    </section>
  `;
}
function B(e) {
  var o;
  const t = (o = e.confirmation) == null ? void 0 : o.presentationPayload;
  return t ? `
    <section class="panel" data-stage="Confirmation">
      <p class="eyebrow">Confirmation</p>
      <h2>${r(t.title)}</h2>
      <p class="body">${J(t.body)}</p>
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="confirm">
          ${r(t.primaryAction)}
        </button>
        <button type="button" class="btn btn-ghost" data-action="edit-selection">
          ${r(t.secondaryAction)}
        </button>
      </div>
    </section>
  ` : '<section class="panel"><p>Chybí Confirmation payload ve fixture.</p></section>';
}
function K(e) {
  var o;
  const t = ((o = e.transitionMessage) == null ? void 0 : o.text) ?? "Teď se podíváme na dům vaší optikou.";
  return `
    <section class="panel" data-stage="Transition">
      <p class="eyebrow">Transition</p>
      <h2>Připravujeme čtení</h2>
      <p class="lede">${r(t)}</p>
      <button type="button" class="btn btn-primary" data-action="complete-transition">
        Pokračovat k interpretaci
      </button>
    </section>
  `;
}
function W(e) {
  const t = e.focus.map((c) => `<li>${r(c)}</li>`).join(""), o = e.evidence.map(
    (c) => `
        <article class="claim">
          <h3>${r(c.title)}</h3>
          <p>${r(c.description)}</p>
        </article>
      `
  ).join(""), n = e.concerns.map(
    (c) => `
        <article class="claim claim--concern">
          <h3>${r(c.title)}</h3>
          <p>${r(c.description)}</p>
        </article>
      `
  ).join(""), i = e.recommendations.map((c) => `<li>${r(c)}</li>`).join("");
  return `
    <header class="experience-header">
      <h2>${r(e.title)}</h2>
      <p class="lede">${r(e.summary)}</p>
      <p class="confidence">
        Jistota: ${r(e.confidence.level)}
        (${e.confidence.score}) — ${r(e.confidence.explanation)}
      </p>
    </header>
    <div class="experience-grid">
      <section>
        <h3>Focus</h3>
        <ul>${t}</ul>
      </section>
      <section>
        <h3>Proč toto čtení</h3>
        ${o}
      </section>
      <section>
        <h3>Na co si dát pozor</h3>
        ${n}
      </section>
      <section>
        <h3>Další porozumění</h3>
        <ul>${i}</ul>
      </section>
    </div>
  `;
}
function Q(e, t) {
  if (!e.experience)
    return `
      <section class="panel" data-stage="Interpretation">
        <p class="eyebrow">Interpretation</p>
        <h2>Připravit Experience</h2>
        <p class="lede">Runtime je ve fázi Interpretation. Fixture dodá Experience — renderer ji nevymýšlí.</p>
        <button type="button" class="btn btn-primary" data-action="ready-interpretation">
          Načíst čtení z Garden fixture
        </button>
      </section>
    `;
  const o = e.experience ?? t.experience;
  return o ? `
    <section class="panel panel--wide" data-stage="Interpretation">
      <p class="eyebrow">Interpretation → Experience</p>
      ${W(o)}
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="ready-mapping">
          Pokračovat k House Mapping
        </button>
      </div>
    </section>
  ` : '<section class="panel"><p>Experience chybí.</p></section>';
}
function X(e, t) {
  const o = e.entries.map(
    (i) => `
        <li class="mapping-item">
          <p class="mapping-item__anchor">
            <span class="tag">${r(i.objectAnchor.kind)}</span>
            ${r(i.objectAnchor.id)}
          </p>
          <p class="mapping-item__why">${r(i.why)}</p>
          <p class="mapping-item__claim">claim: ${r(i.claimRef.claimId)}</p>
        </li>
      `
  ).join(""), n = t.map(
    (i) => `
        <button
          type="button"
          class="btn btn-secondary"
          data-action="select-followup"
          data-target-id="${r(i.targetId)}"
        >
          ${r(i.label)}
        </button>
      `
  ).join("");
  return `
    <section class="panel panel--wide" data-stage="HouseMapping">
      <p class="eyebrow">House Mapping</p>
      <h2>Kde v domě ověřit zahradu</h2>
      <p class="lede">Kotvy pocházejí z fixture / Runtime state — renderer jen zobrazuje.</p>
      <ul class="mapping-list">${o}</ul>
      <h3>Follow-up</h3>
      <div class="actions actions--wrap">${n}</div>
    </section>
  `;
}
function ee(e) {
  return `
    <section class="panel" data-stage="FollowUp">
      <p class="eyebrow">Follow-up</p>
      <h2>Journey dokončena</h2>
      <p class="lede">
        Runtime Engine označil Journey jako completed.
        Objekt: <code>${r(e.object.objectId)}</code>
      </p>
      <button type="button" class="btn btn-ghost" data-action="reset">
        Spustit Journey znovu
      </button>
    </section>
  `;
}
function te(e) {
  const { state: t, fixture: o } = e;
  switch (t.stage) {
    case "Selection":
      return Z(o);
    case "Confirmation":
      return B(o);
    case "Transition":
      return K(o);
    case "Interpretation":
      return Q(t, o);
    case "HouseMapping":
      return X(
        t.houseMapping ?? o.houseMapping,
        t.followUps ?? o.followUps ?? []
      );
    case "FollowUp":
      return ee(t);
    default: {
      const n = t.stage;
      return `<section class="panel"><p>Neznámá fáze: ${r(String(n))}</p></section>`;
    }
  }
}
function oe(e) {
  const t = e.errorMessage ? `<p class="banner banner--error" role="alert">${r(e.errorMessage)}</p>` : "", o = e.state.completed ? '<p class="banner banner--ok">Stav: Completed</p>' : "";
  return `
    <header class="hero">
      <p class="brand">Priority Experience</p>
      <h1>Garden — HTML Renderer v0.1</h1>
      <p class="hero__sub">Vizualizace nad Runtime Engine. Data: createGardenJourneyRun().</p>
    </header>
    ${Y(e.state.stage)}
    ${t}
    ${o}
    <main id="stage-root">
      ${te(e)}
    </main>
  `;
}
const ne = `
.embed-root {
  --embed-bg: #e8f0ea;
  --embed-bg-deep: #d5e4da;
  --embed-ink: #1c2b22;
  --embed-muted: #4a5c52;
  --embed-panel: #f7fbf8;
  --embed-line: #b7c9be;
  --embed-accent: #2f6b4f;
  --embed-accent-ink: #f4faf6;
  --embed-warn: #8a3b2d;
  --embed-ok: #1f5c3d;
  --embed-shadow: 0 18px 50px rgba(28, 43, 34, 0.08);
  --embed-font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --embed-font-body: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;

  box-sizing: border-box;
  color: var(--embed-ink);
  font-family: var(--embed-font-body);
  width: min(920px, 100%);
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  background:
    radial-gradient(900px 480px at 10% -10%, #f4fff7 0%, transparent 55%),
    linear-gradient(160deg, var(--embed-bg) 0%, var(--embed-bg-deep) 100%);
  border-radius: 1.25rem;
}

.embed-root *,
.embed-root *::before,
.embed-root *::after {
  box-sizing: border-box;
}

.embed-root .hero { margin-bottom: 1.75rem; }
.embed-root .brand {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--embed-accent);
  font-weight: 700;
}
.embed-root .hero h1 {
  margin: 0;
  font-family: var(--embed-font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.15;
  font-weight: 600;
}
.embed-root .hero__sub {
  margin: 0.75rem 0 0;
  color: var(--embed-muted);
  max-width: 38rem;
}
.embed-root .stage-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
}
.embed-root .stage-rail__item {
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--embed-line);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--embed-muted);
  background: rgba(247, 251, 248, 0.7);
}
.embed-root .stage-rail__item.is-active {
  color: var(--embed-accent-ink);
  background: var(--embed-accent);
  border-color: var(--embed-accent);
}
.embed-root .banner {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin: 0 0 1rem;
}
.embed-root .banner--error {
  background: #f8e8e4;
  color: var(--embed-warn);
}
.embed-root .banner--ok {
  background: #dff0e6;
  color: var(--embed-ok);
}
.embed-root .panel {
  background: var(--embed-panel);
  border: 1px solid var(--embed-line);
  border-radius: 1.25rem;
  padding: 1.5rem 1.6rem 1.7rem;
  box-shadow: var(--embed-shadow);
}
.embed-root .panel--wide { padding-bottom: 1.9rem; }
.embed-root .eyebrow {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--embed-accent);
  font-weight: 700;
}
.embed-root .panel h2,
.embed-root .experience-header h2 {
  margin: 0 0 0.65rem;
  font-family: var(--embed-font-display);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 600;
}
.embed-root .lede,
.embed-root .body {
  margin: 0 0 1.25rem;
  color: var(--embed-muted);
  line-height: 1.55;
  white-space: pre-wrap;
}
.embed-root .confidence {
  margin: 0 0 1.25rem;
  color: var(--embed-ink);
  line-height: 1.5;
  font-size: 0.95rem;
}
.embed-root .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}
.embed-root .actions--wrap { margin-top: 0.35rem; }
.embed-root .btn {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.7rem 1.15rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.embed-root .btn-primary {
  background: var(--embed-accent);
  color: var(--embed-accent-ink);
}
.embed-root .btn-secondary {
  background: #eef6f1;
  color: var(--embed-accent);
  border-color: var(--embed-line);
}
.embed-root .btn-ghost {
  background: transparent;
  color: var(--embed-muted);
  border-color: var(--embed-line);
}
.embed-root .btn:hover { filter: brightness(0.97); }
.embed-root .experience-grid {
  display: grid;
  gap: 1.1rem;
  margin-bottom: 1.35rem;
}
@media (min-width: 720px) {
  .embed-root .experience-grid { grid-template-columns: 1fr 1fr; }
}
.embed-root .experience-grid h3,
.embed-root .panel h3 {
  margin: 0 0 0.55rem;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--embed-accent);
}
.embed-root .experience-grid ul {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--embed-muted);
}
.embed-root .claim {
  margin: 0 0 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.85rem;
  background: #eef5f0;
}
.embed-root .claim--concern { background: #f4eee8; }
.embed-root .claim h3 {
  margin: 0 0 0.35rem;
  text-transform: none;
  letter-spacing: 0;
  font-size: 1rem;
  color: var(--embed-ink);
}
.embed-root .claim p {
  margin: 0;
  color: var(--embed-muted);
  line-height: 1.45;
}
.embed-root .mapping-list {
  list-style: none;
  margin: 0 0 1.4rem;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}
.embed-root .mapping-item {
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: #eef5f0;
  border: 1px solid var(--embed-line);
}
.embed-root .mapping-item__anchor {
  margin: 0 0 0.35rem;
  font-weight: 600;
}
.embed-root .mapping-item__why,
.embed-root .mapping-item__claim {
  margin: 0;
  color: var(--embed-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}
.embed-root .mapping-item__claim {
  margin-top: 0.35rem;
  font-size: 0.8rem;
}
.embed-root .tag {
  display: inline-block;
  margin-right: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--embed-accent);
  color: var(--embed-accent-ink);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.embed-root code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}
`;
function m(e, t) {
  return e.find((o) => o.type === t);
}
function re(e, t, o) {
  const n = document.createElement("style");
  n.setAttribute("data-embed-engine", "priority-styles"), n.textContent = ne, document.head.appendChild(n);
  const i = document.createElement("div");
  i.className = "embed-root", i.setAttribute("data-embed-root", ""), e.appendChild(i);
  const c = C(t.object.objectId);
  let u = null;
  const k = () => {
    i.innerHTML = oe({
      state: c.getState(),
      fixture: t,
      errorMessage: u
    });
  }, p = (l) => {
    const d = c.dispatch(l);
    if (!d.ok) {
      u = `${d.error.code}: ${d.error.message}`;
      return;
    }
    u = null;
  }, P = (l, d) => {
    switch (l) {
      case "select-garden": {
        const a = m(o, "priority.selection.changed");
        a && p(a);
        break;
      }
      case "confirm": {
        const a = m(
          o,
          "priority.confirmation.accepted"
        );
        a && p(a);
        break;
      }
      case "edit-selection": {
        p({ type: "priority.confirmation.edit" });
        break;
      }
      case "complete-transition": {
        const a = m(
          o,
          "priority.transition.completed"
        );
        a && p(a);
        break;
      }
      case "ready-interpretation": {
        const a = m(
          o,
          "priority.interpretation.ready"
        );
        a && p(a);
        break;
      }
      case "ready-mapping": {
        const a = m(o, "priority.mapping.ready");
        a && p(a);
        break;
      }
      case "select-followup": {
        if (!d) return;
        p({
          type: "priority.followup.selected",
          targetId: d
        });
        break;
      }
      case "reset": {
        c.reset(), u = null;
        break;
      }
    }
    k();
  }, w = (l) => {
    const d = l.target;
    if (!(d instanceof HTMLElement)) return;
    const a = d.closest("[data-action]");
    a instanceof HTMLElement && P(a.dataset.action ?? "", a.dataset.targetId ?? null);
  };
  return i.addEventListener("click", w), k(), { root: i, host: e, styleElement: n, dispose: () => {
    i.removeEventListener("click", w), i.remove(), n.remove();
  } };
}
function ie(e) {
  if ("fixture" in e && e.fixture === "garden")
    return G();
  if ("experience" in e && e.experience)
    return e.experience;
  throw new Error(
    'Embed.mount requires either { fixture: "garden" } or { experience: PriorityJourneyRun }'
  );
}
function ae(e) {
  var t;
  if (!((t = e.confirmation) != null && t.presentationPayload))
    throw new Error(
      "Embed.mount experience requires confirmation.presentationPayload"
    );
  if (!e.interpretation || !e.experience)
    throw new Error(
      "Embed.mount experience requires interpretation and experience artifacts"
    );
  if (!e.houseMapping || !e.followUps || e.followUps.length === 0)
    throw new Error(
      "Embed.mount experience requires houseMapping and at least one followUp"
    );
  return [
    {
      type: "priority.selection.changed",
      selection: e.selection
    },
    {
      type: "priority.confirmation.accepted",
      presentationPayload: e.confirmation.presentationPayload
    },
    {
      type: "priority.transition.completed",
      transitionMessage: e.transitionMessage ?? void 0
    },
    {
      type: "priority.interpretation.ready",
      interpretation: e.interpretation,
      experience: e.experience
    },
    {
      type: "priority.mapping.ready",
      houseMapping: e.houseMapping,
      followUps: e.followUps
    }
  ];
}
function se(e, t) {
  return "fixture" in e && e.fixture === "garden" ? q().filter(
    (o) => o.type !== "priority.followup.selected"
  ) : ae(t);
}
let S = null;
function v() {
  return S;
}
function D(e) {
  S = e;
}
function ce(e) {
  var t;
  return e === void 0 ? ((t = v()) == null ? void 0 : t.host) ?? null : typeof e == "string" ? document.querySelector(e) : e;
}
function N(e) {
  const t = v();
  if (!t) return;
  const o = ce(e);
  o && o !== t.host || (t.dispose(), D(null));
}
function de(e) {
  if (typeof e != "string")
    return e;
  const t = document.querySelector(e);
  if (!t)
    throw new Error(`Embed.mount: target not found: ${e}`);
  return t;
}
function pe(e) {
  v() && N();
  const t = de(e.target), o = ie(e), n = se(e, o), i = re(t, o, n);
  D(i);
}
const le = "0.1.0", ue = {
  mount: pe,
  unmount: N,
  version: le
};
export {
  ue as Embed,
  ue as default
};
//# sourceMappingURL=embed.es.js.map
