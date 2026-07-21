/**
 * Priority HTML Renderer v0.1 — visualization only.
 *
 * Renders the current Runtime Engine stage. Does not decide transitions.
 * Content for Garden demo comes from createGardenJourneyRun() fixture.
 */

import type {
  Experience,
  FollowUpHandoff,
  HouseMappingSet,
  JourneyStage,
  PriorityJourneyRun,
} from "@embed-engine/core/priority";
import type { PriorityRuntimeState } from "../PriorityRuntimeState";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

const STAGE_LABELS: Record<JourneyStage, string> = {
  Selection: "Selection",
  Confirmation: "Confirmation",
  Transition: "Transition",
  Interpretation: "Interpretation",
  HouseMapping: "House Mapping",
  FollowUp: "Follow-up",
};

export type PriorityRenderModel = {
  readonly state: PriorityRuntimeState;
  readonly fixture: PriorityJourneyRun;
  readonly errorMessage: string | null;
};

function renderStageRail(current: JourneyStage): string {
  const order: JourneyStage[] = [
    "Selection",
    "Confirmation",
    "Transition",
    "Interpretation",
    "HouseMapping",
    "FollowUp",
  ];

  const items = order
    .map((stage) => {
      const active = stage === current ? " is-active" : "";
      return `<li class="stage-rail__item${active}">${escapeHtml(STAGE_LABELS[stage])}</li>`;
    })
    .join("");

  return `<ol class="stage-rail" aria-label="Journey stages">${items}</ol>`;
}

function renderSelection(fixture: PriorityJourneyRun): string {
  const label = fixture.selection.dominantPriorityId;
  return `
    <section class="panel" data-stage="Selection">
      <p class="eyebrow">Priority Selection</p>
      <h2>Co je pro vás podstatné?</h2>
      <p class="lede">Zvolte čočku. Renderer nic nevyhodnocuje — jen předá výběr Runtime Engine.</p>
      <button type="button" class="btn btn-primary" data-action="select-garden">
        Zvolit prioritu: ${escapeHtml(label)}
      </button>
    </section>
  `;
}

function renderConfirmation(fixture: PriorityJourneyRun): string {
  const payload = fixture.confirmation?.presentationPayload;
  if (!payload) {
    return `<section class="panel"><p>Chybí Confirmation payload ve fixture.</p></section>`;
  }

  return `
    <section class="panel" data-stage="Confirmation">
      <p class="eyebrow">Confirmation</p>
      <h2>${escapeHtml(payload.title)}</h2>
      <p class="body">${nl2br(payload.body)}</p>
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="confirm">
          ${escapeHtml(payload.primaryAction)}
        </button>
        <button type="button" class="btn btn-ghost" data-action="edit-selection">
          ${escapeHtml(payload.secondaryAction)}
        </button>
      </div>
    </section>
  `;
}

function renderTransition(fixture: PriorityJourneyRun): string {
  const text =
    fixture.transitionMessage?.text ??
    "Teď se podíváme na dům vaší optikou.";

  return `
    <section class="panel" data-stage="Transition">
      <p class="eyebrow">Transition</p>
      <h2>Připravujeme čtení</h2>
      <p class="lede">${escapeHtml(text)}</p>
      <button type="button" class="btn btn-primary" data-action="complete-transition">
        Pokračovat k interpretaci
      </button>
    </section>
  `;
}

function renderExperience(experience: Experience): string {
  const focus = experience.focus
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const evidence = experience.evidence
    .map(
      (item) => `
        <article class="claim">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `,
    )
    .join("");
  const concerns = experience.concerns
    .map(
      (item) => `
        <article class="claim claim--concern">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `,
    )
    .join("");
  const recommendations = experience.recommendations
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <header class="experience-header">
      <h2>${escapeHtml(experience.title)}</h2>
      <p class="lede">${escapeHtml(experience.summary)}</p>
      <p class="confidence">
        Jistota: ${escapeHtml(experience.confidence.level)}
        (${experience.confidence.score}) — ${escapeHtml(experience.confidence.explanation)}
      </p>
    </header>
    <div class="experience-grid">
      <section>
        <h3>Focus</h3>
        <ul>${focus}</ul>
      </section>
      <section>
        <h3>Proč toto čtení</h3>
        ${evidence}
      </section>
      <section>
        <h3>Na co si dát pozor</h3>
        ${concerns}
      </section>
      <section>
        <h3>Další porozumění</h3>
        <ul>${recommendations}</ul>
      </section>
    </div>
  `;
}

function renderInterpretation(
  state: PriorityRuntimeState,
  fixture: PriorityJourneyRun,
): string {
  if (!state.experience) {
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
  }

  const experience = state.experience ?? fixture.experience;
  if (!experience) {
    return `<section class="panel"><p>Experience chybí.</p></section>`;
  }

  return `
    <section class="panel panel--wide" data-stage="Interpretation">
      <p class="eyebrow">Interpretation → Experience</p>
      ${renderExperience(experience)}
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="ready-mapping">
          Pokračovat k House Mapping
        </button>
      </div>
    </section>
  `;
}

function renderHouseMapping(
  mapping: HouseMappingSet,
  followUps: readonly FollowUpHandoff[],
): string {
  const entries = mapping.entries
    .map(
      (entry) => `
        <li class="mapping-item">
          <p class="mapping-item__anchor">
            <span class="tag">${escapeHtml(entry.objectAnchor.kind)}</span>
            ${escapeHtml(entry.objectAnchor.id)}
          </p>
          <p class="mapping-item__why">${escapeHtml(entry.why)}</p>
          <p class="mapping-item__claim">claim: ${escapeHtml(entry.claimRef.claimId)}</p>
        </li>
      `,
    )
    .join("");

  const handoffs = followUps
    .map(
      (item) => `
        <button
          type="button"
          class="btn btn-secondary"
          data-action="select-followup"
          data-target-id="${escapeHtml(item.targetId)}"
        >
          ${escapeHtml(item.label)}
        </button>
      `,
    )
    .join("");

  return `
    <section class="panel panel--wide" data-stage="HouseMapping">
      <p class="eyebrow">House Mapping</p>
      <h2>Kde v domě ověřit zahradu</h2>
      <p class="lede">Kotvy pocházejí z fixture / Runtime state — renderer jen zobrazuje.</p>
      <ul class="mapping-list">${entries}</ul>
      <h3>Follow-up</h3>
      <div class="actions actions--wrap">${handoffs}</div>
    </section>
  `;
}

function renderFollowUp(state: PriorityRuntimeState): string {
  return `
    <section class="panel" data-stage="FollowUp">
      <p class="eyebrow">Follow-up</p>
      <h2>Journey dokončena</h2>
      <p class="lede">
        Runtime Engine označil Journey jako completed.
        Objekt: <code>${escapeHtml(state.object.objectId)}</code>
      </p>
      <button type="button" class="btn btn-ghost" data-action="reset">
        Spustit Journey znovu
      </button>
    </section>
  `;
}

function renderStageBody(model: PriorityRenderModel): string {
  const { state, fixture } = model;

  switch (state.stage) {
    case "Selection":
      return renderSelection(fixture);
    case "Confirmation":
      return renderConfirmation(fixture);
    case "Transition":
      return renderTransition(fixture);
    case "Interpretation":
      return renderInterpretation(state, fixture);
    case "HouseMapping":
      return renderHouseMapping(
        state.houseMapping ?? fixture.houseMapping!,
        state.followUps ?? fixture.followUps ?? [],
      );
    case "FollowUp":
      return renderFollowUp(state);
    default: {
      const _exhaustive: never = state.stage;
      return `<section class="panel"><p>Neznámá fáze: ${escapeHtml(String(_exhaustive))}</p></section>`;
    }
  }
}

/**
 * Build full document body HTML for the current engine state.
 */
export function renderPriorityJourney(model: PriorityRenderModel): string {
  const error = model.errorMessage
    ? `<p class="banner banner--error" role="alert">${escapeHtml(model.errorMessage)}</p>`
    : "";

  const complete = model.state.completed
    ? `<p class="banner banner--ok">Stav: Completed</p>`
    : "";

  return `
    <header class="hero">
      <p class="brand">Priority Experience</p>
      <h1>Garden — HTML Renderer v0.1</h1>
      <p class="hero__sub">Vizualizace nad Runtime Engine. Data: createGardenJourneyRun().</p>
    </header>
    ${renderStageRail(model.state.stage)}
    ${error}
    ${complete}
    <main id="stage-root">
      ${renderStageBody(model)}
    </main>
  `;
}
