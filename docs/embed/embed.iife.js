var Embed=(function(){"use strict";const P={selectedPriorityIds:[],dominantPriorityId:""};function k(e){return{object:e,stage:"Selection",selection:P,confirmation:null,transitionMessage:null,interpretation:null,experience:null,houseMapping:null,followUps:null,completed:!1}}function I(e){return e.completed}function b(e){return e.selectedPriorityIds.length>0&&e.dominantPriorityId.length>0&&e.selectedPriorityIds.includes(e.dominantPriorityId)}function w(e){return e.confirmation!==null&&e.confirmation.accepted}function U(e){return e.experience!==null}function L(e){return e.houseMapping!==null&&e.houseMapping.entries.length>0}function s(e,t,o,r){return{ok:!1,state:e,error:{code:o,message:r,stage:e.stage,event:t}}}function E(){return{confirmation:null,transitionMessage:null,interpretation:null,experience:null,houseMapping:null,followUps:null,completed:!1}}function x(e,t,o){return{ok:!0,state:{...e,...E(),stage:t,selection:o},emitted:["priority.context.invalidated"]}}function O(e,t){if(I(e)&&t.type!=="priority.selection.changed")return s(e,t.type,"JOURNEY_ALREADY_COMPLETED","Journey is complete; only selection change (new run) or reset is allowed");switch(t.type){case"priority.selection.changed":{const o=t.selection,r=b(o)?"Confirmation":"Selection";return x(e,r,o)}case"priority.confirmation.edit":return e.stage!=="Confirmation"&&e.stage!=="Transition"?s(e,t.type,"INVALID_TRANSITION","confirmation.edit is only valid from Confirmation (or Transition before Interpretation)"):{ok:!0,state:{...e,...E(),stage:"Selection"},emitted:[]};case"priority.confirmation.accepted":{if(e.stage!=="Confirmation")return s(e,t.type,"INVALID_TRANSITION","confirmation.accepted requires Confirmation stage");if(!b(e.selection))return s(e,t.type,"GUARD_FAILED","confirmation.accepted requires a non-empty Priority Selection");const o={selectionSnapshot:e.selection,accepted:!0,presentationPayload:t.presentationPayload};return{ok:!0,state:{...e,confirmation:o,stage:"Transition",completed:!1},emitted:[]}}case"priority.transition.completed":return e.stage!=="Transition"?s(e,t.type,"INVALID_TRANSITION","transition.completed requires Transition stage"):w(e)?{ok:!0,state:{...e,transitionMessage:t.transitionMessage??e.transitionMessage,stage:"Interpretation"},emitted:[]}:s(e,t.type,"GUARD_FAILED","transition.completed requires prior Confirmation");case"priority.interpretation.ready":return e.stage!=="Interpretation"?s(e,t.type,"INVALID_TRANSITION","interpretation.ready requires Interpretation stage"):w(e)?{ok:!0,state:{...e,interpretation:t.interpretation,experience:t.experience,houseMapping:null,followUps:null,stage:"Interpretation"},emitted:[]}:s(e,t.type,"GUARD_FAILED","interpretation.ready must not fire before confirmation.accepted");case"priority.mapping.ready":return e.stage!=="Interpretation"&&e.stage!=="HouseMapping"?s(e,t.type,"INVALID_TRANSITION","mapping.ready requires Interpretation (with Experience) or HouseMapping stage"):U(e)?t.houseMapping.entries.length===0?s(e,t.type,"GUARD_FAILED","mapping.ready requires a non-empty House Mapping set"):t.followUps.length===0?s(e,t.type,"GUARD_FAILED","Follow-up requires at least one handoff when Mapping completes"):{ok:!0,state:{...e,houseMapping:t.houseMapping,followUps:t.followUps,stage:"HouseMapping"},emitted:[]}:s(e,t.type,"GUARD_FAILED","mapping.ready must not fire before interpretation.ready (Experience required)");case"priority.followup.selected":return e.stage!=="HouseMapping"&&e.stage!=="FollowUp"?s(e,t.type,"INVALID_TRANSITION","followup.selected requires HouseMapping or FollowUp stage"):L(e)?(e.followUps??[]).some(r=>r.targetId===t.targetId)?{ok:!0,state:{...e,stage:"FollowUp",completed:!0},emitted:[]}:s(e,t.type,"GUARD_FAILED","followup.selected targetId must be one of the exposed handoffs"):s(e,t.type,"GUARD_FAILED","followup.selected requires House Mapping to be ready");case"priority.context.invalidated":{const o=b(e.selection)?"Confirmation":"Selection";return x(e,o,e.selection)}default:return s(e,t.type,"INVALID_TRANSITION","Unknown event")}}function $(e){let t=k({objectId:e});return{getState(){return t},isComplete(){return I(t)},reset(){return t=k(t.object),t},dispatch(o){const r=O(t,o);return r.ok&&(t=r.state),r}}}const f="garden",g="house-modern-01",y={stageMicrocopy:{confirmation:{title:"Zahrada je pro vás podstatná",body:`Podle vašeho výběru budeme dům číst hlavně podle toho, jak se bydlí venku a jak je dům s venkovním prostorem propojený.

Ještě nehodnotíme, jestli je dům „ideální“.
Nejdřív potvrďte, že toto je opravdu váš důraz.`,primaryAction:"Potvrdit a pokračovat",secondaryAction:"Upravit priority"},transition:"Teď se podíváme na dům vaší optikou zahrady — co venkovní život v tomto objektu podporuje a na co si dát pozor."}},h={selectedPriorityIds:[f],dominantPriorityId:f},_={id:"mock-interpretation-garden-house-modern-01",objectId:g,priorityIds:[f],strengths:[{id:"str-outdoor-daily",code:"OUTDOOR_DAILY_LIFE",weight:.82},{id:"str-day-zone-open",code:"DAY_ZONE_OUTDOOR_POTENTIAL",weight:.78},{id:"str-privacy-lot",code:"LOT_PRIVACY_POTENTIAL",weight:.7}],frictions:[{id:"fri-garden-variability",code:"GARDEN_QUALITY_VARIABLE",weight:.55},{id:"fri-access-levels",code:"OUTDOOR_ACCESS_LEVEL_CHECK",weight:.5}],opportunities:[{id:"opp-verify-threshold",code:"VERIFY_DAY_ZONE_THRESHOLD",weight:.75}],tradeOffs:[{id:"to-garden-vs-layout",code:"GARDEN_VS_INTERNAL_LAYOUT",favors:"OUTDOOR_DAILY_LIFE",against:"INTERNAL_LAYOUT_INDEPENDENT"}],confidenceInputs:[{id:"ci-priority",code:"PRIORITY_LENS_GARDEN",contribution:.4},{id:"ci-object-basics",code:"OBJECT_BASIC_FACTS",contribution:.35},{id:"ci-usage-unknown",code:"USAGE_PREFERENCE_UNKNOWN",contribution:-.15}],matchScore:62,recommendedIntent:"VERIFY_HOUSE_GARDEN_THRESHOLD"},A={id:"mock-experience-garden-house-modern-01",title:"Čtení domu přes zahradu",summary:"Podle vaší priority Zahrada se tento dům čte jako objekt, kde venkovní prostor není jen „něco navíc“, ale součást každodenního bydlení — pokud sedí propojení denní zóny s venkem a charakter pozemku.",focus:["vztah domu k venkovnímu prostoru","propojení denní zóny ven","soukromí na pozemku"],evidence:[{id:"ev-outdoor-relation",title:"Vztah k venkovnímu prostoru",description:"Dům nabízí vztah k venkovnímu prostoru, který lze číst jako součást denního života."},{id:"ev-day-zone",title:"Denní zóna a východ ven",description:"Denní zóna má potenciál otevřít se ven — posezení a pohyb venku pak dávají smysl."},{id:"ev-privacy-lot",title:"Soukromí mimo ulici",description:"Zahrada / pozemek dává prostor soukromí mimo ulici — pokud to dispozice a okolí podporují."}],concerns:[{id:"co-garden-not-equal",title:"Ne každá zahrada znamená stejný život venku",description:"Záleží na velikosti, soukromí a dostupnosti z domu.",severity:"medium"},{id:"co-verify-access",title:"Ověřit východ a výškové rozdíly",description:"Pokud je klíčové přímé propojení obývacího prostoru ven, ověřte konkrétní východ a výškové rozdíly.",severity:"medium"},{id:"co-layout-not-solved",title:"Zahrada neřeší dispozici uvnitř",description:"Zahrada jen mění, co je při prohlídce důležité — neřeší sama o sobě vnitřní uspořádání.",severity:"low"}],confidence:{level:"medium",score:62,explanation:"Střední — opírá se o vybranou prioritu a základní fakta domu; ještě neznáme vaši přesnou představu o velikosti a způsobu užívání zahrady."},recommendations:["Prohlédněte místa, kde dům potkává zahradu — denní zónu a východ ven."],actions:[{id:"act-map-threshold",label:"Podívat se na místa dům ↔ zahrada",type:"primary",intent:"explore"},{id:"act-review-reading",label:"Vrátit se k interpretační kartě",type:"secondary",intent:"explore"}]},z={text:y.stageMicrocopy.transition},j={object:{objectId:g},entries:[{claimRef:{claimId:"ev-day-zone"},objectAnchor:{kind:"zone",id:"day-zone-outdoor-exit"},why:"Ukazuje, jestli je venkovní život součástí dne, nebo oddělený „na konci domu“."},{claimRef:{claimId:"ev-outdoor-relation"},objectAnchor:{kind:"element",id:"terrace-threshold"},why:"Posezení a prah mezi interiérem a zahradou — praktický střed zahradního bydlení."},{claimRef:{claimId:"ev-privacy-lot"},objectAnchor:{kind:"zone",id:"garden-lot"},why:"Dává měřítko: je venku kam jít, hrát si, sedět, mít klid."},{claimRef:{claimId:"co-garden-not-equal"},objectAnchor:{kind:"relation",id:"street-neighbor-privacy"},why:"Zahrada bez soukromí často nesplní motivaci „vlastní venku“."},{claimRef:{claimId:"ev-outdoor-relation"},objectAnchor:{kind:"medium",id:"interior-green-view"},why:"Posiluje čtení, že zahrada patří k atmosféře bydlení, ne jen k pozemku."}]},R=[{targetId:"tour-day-zone",label:"Prohlídka denní zóny"},{targetId:"media-exterior-garden",label:"Média exteriér / zahrada"},{targetId:"decision-terminal",label:"Decision Terminal / Experience shrnutí"}],C="tour-day-zone";function F(){return{selectionSnapshot:h,accepted:!0,presentationPayload:y.stageMicrocopy.confirmation}}function H(){return{object:{objectId:g},stage:"FollowUp",selection:h,confirmation:F(),transitionMessage:z,interpretation:_,experience:A,houseMapping:j,followUps:R}}function G(){return[{type:"priority.selection.changed",selection:h},{type:"priority.confirmation.accepted",presentationPayload:y.stageMicrocopy.confirmation},{type:"priority.transition.completed",transitionMessage:z},{type:"priority.interpretation.ready",interpretation:_,experience:A},{type:"priority.mapping.ready",houseMapping:j,followUps:R},{type:"priority.followup.selected",targetId:C}]}function n(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function q(e){return n(e).replaceAll(`
`,"<br />")}const V={Selection:"Selection",Confirmation:"Confirmation",Transition:"Transition",Interpretation:"Interpretation",HouseMapping:"House Mapping",FollowUp:"Follow-up"};function J(e){return`<ol class="stage-rail" aria-label="Journey stages">${["Selection","Confirmation","Transition","Interpretation","HouseMapping","FollowUp"].map(r=>`<li class="stage-rail__item${r===e?" is-active":""}">${n(V[r])}</li>`).join("")}</ol>`}function Y(e){const t=e.selection.dominantPriorityId;return`
    <section class="panel" data-stage="Selection">
      <p class="eyebrow">Priority Selection</p>
      <h2>Co je pro vás podstatné?</h2>
      <p class="lede">Zvolte čočku. Renderer nic nevyhodnocuje — jen předá výběr Runtime Engine.</p>
      <button type="button" class="btn btn-primary" data-action="select-garden">
        Zvolit prioritu: ${n(t)}
      </button>
    </section>
  `}function B(e){var o;const t=(o=e.confirmation)==null?void 0:o.presentationPayload;return t?`
    <section class="panel" data-stage="Confirmation">
      <p class="eyebrow">Confirmation</p>
      <h2>${n(t.title)}</h2>
      <p class="body">${q(t.body)}</p>
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="confirm">
          ${n(t.primaryAction)}
        </button>
        <button type="button" class="btn btn-ghost" data-action="edit-selection">
          ${n(t.secondaryAction)}
        </button>
      </div>
    </section>
  `:'<section class="panel"><p>Chybí Confirmation payload ve fixture.</p></section>'}function Z(e){var o;const t=((o=e.transitionMessage)==null?void 0:o.text)??"Teď se podíváme na dům vaší optikou.";return`
    <section class="panel" data-stage="Transition">
      <p class="eyebrow">Transition</p>
      <h2>Připravujeme čtení</h2>
      <p class="lede">${n(t)}</p>
      <button type="button" class="btn btn-primary" data-action="complete-transition">
        Pokračovat k interpretaci
      </button>
    </section>
  `}function K(e){const t=e.focus.map(c=>`<li>${n(c)}</li>`).join(""),o=e.evidence.map(c=>`
        <article class="claim">
          <h3>${n(c.title)}</h3>
          <p>${n(c.description)}</p>
        </article>
      `).join(""),r=e.concerns.map(c=>`
        <article class="claim claim--concern">
          <h3>${n(c.title)}</h3>
          <p>${n(c.description)}</p>
        </article>
      `).join(""),i=e.recommendations.map(c=>`<li>${n(c)}</li>`).join("");return`
    <header class="experience-header">
      <h2>${n(e.title)}</h2>
      <p class="lede">${n(e.summary)}</p>
      <p class="confidence">
        Jistota: ${n(e.confidence.level)}
        (${e.confidence.score}) — ${n(e.confidence.explanation)}
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
        ${r}
      </section>
      <section>
        <h3>Další porozumění</h3>
        <ul>${i}</ul>
      </section>
    </div>
  `}function W(e,t){if(!e.experience)return`
      <section class="panel" data-stage="Interpretation">
        <p class="eyebrow">Interpretation</p>
        <h2>Připravit Experience</h2>
        <p class="lede">Runtime je ve fázi Interpretation. Fixture dodá Experience — renderer ji nevymýšlí.</p>
        <button type="button" class="btn btn-primary" data-action="ready-interpretation">
          Načíst čtení z Garden fixture
        </button>
      </section>
    `;const o=e.experience??t.experience;return o?`
    <section class="panel panel--wide" data-stage="Interpretation">
      <p class="eyebrow">Interpretation → Experience</p>
      ${K(o)}
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="ready-mapping">
          Pokračovat k House Mapping
        </button>
      </div>
    </section>
  `:'<section class="panel"><p>Experience chybí.</p></section>'}function Q(e,t){const o=e.entries.map(i=>`
        <li class="mapping-item">
          <p class="mapping-item__anchor">
            <span class="tag">${n(i.objectAnchor.kind)}</span>
            ${n(i.objectAnchor.id)}
          </p>
          <p class="mapping-item__why">${n(i.why)}</p>
          <p class="mapping-item__claim">claim: ${n(i.claimRef.claimId)}</p>
        </li>
      `).join(""),r=t.map(i=>`
        <button
          type="button"
          class="btn btn-secondary"
          data-action="select-followup"
          data-target-id="${n(i.targetId)}"
        >
          ${n(i.label)}
        </button>
      `).join("");return`
    <section class="panel panel--wide" data-stage="HouseMapping">
      <p class="eyebrow">House Mapping</p>
      <h2>Kde v domě ověřit zahradu</h2>
      <p class="lede">Kotvy pocházejí z fixture / Runtime state — renderer jen zobrazuje.</p>
      <ul class="mapping-list">${o}</ul>
      <h3>Follow-up</h3>
      <div class="actions actions--wrap">${r}</div>
    </section>
  `}function X(e){return`
    <section class="panel" data-stage="FollowUp">
      <p class="eyebrow">Follow-up</p>
      <h2>Journey dokončena</h2>
      <p class="lede">
        Runtime Engine označil Journey jako completed.
        Objekt: <code>${n(e.object.objectId)}</code>
      </p>
      <button type="button" class="btn btn-ghost" data-action="reset">
        Spustit Journey znovu
      </button>
    </section>
  `}function ee(e){const{state:t,fixture:o}=e;switch(t.stage){case"Selection":return Y(o);case"Confirmation":return B(o);case"Transition":return Z(o);case"Interpretation":return W(t,o);case"HouseMapping":return Q(t.houseMapping??o.houseMapping,t.followUps??o.followUps??[]);case"FollowUp":return X(t);default:{const r=t.stage;return`<section class="panel"><p>Neznámá fáze: ${n(String(r))}</p></section>`}}}function te(e){const t=e.errorMessage?`<p class="banner banner--error" role="alert">${n(e.errorMessage)}</p>`:"",o=e.state.completed?'<p class="banner banner--ok">Stav: Completed</p>':"";return`
    <header class="hero">
      <p class="brand">Priority Experience</p>
      <h1>Garden — HTML Renderer v0.1</h1>
      <p class="hero__sub">Vizualizace nad Runtime Engine. Data: createGardenJourneyRun().</p>
    </header>
    ${J(e.state.stage)}
    ${t}
    ${o}
    <main id="stage-root">
      ${ee(e)}
    </main>
  `}const oe=`
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
`;function l(e,t){return e.find(o=>o.type===t)}function ne(e,t,o){const r=document.createElement("style");r.setAttribute("data-embed-engine","priority-styles"),r.textContent=oe,document.head.appendChild(r);const i=document.createElement("div");i.className="embed-root",i.setAttribute("data-embed-root",""),e.appendChild(i);const c=$(t.object.objectId);let u=null;const D=()=>{i.innerHTML=te({state:c.getState(),fixture:t,errorMessage:u})},p=m=>{const d=c.dispatch(m);if(!d.ok){u=`${d.error.code}: ${d.error.message}`;return}u=null},pe=(m,d)=>{switch(m){case"select-garden":{const a=l(o,"priority.selection.changed");a&&p(a);break}case"confirm":{const a=l(o,"priority.confirmation.accepted");a&&p(a);break}case"edit-selection":{p({type:"priority.confirmation.edit"});break}case"complete-transition":{const a=l(o,"priority.transition.completed");a&&p(a);break}case"ready-interpretation":{const a=l(o,"priority.interpretation.ready");a&&p(a);break}case"ready-mapping":{const a=l(o,"priority.mapping.ready");a&&p(a);break}case"select-followup":{if(!d)return;p({type:"priority.followup.selected",targetId:d});break}case"reset":{c.reset(),u=null;break}}D()},N=m=>{const d=m.target;if(!(d instanceof HTMLElement))return;const a=d.closest("[data-action]");a instanceof HTMLElement&&pe(a.dataset.action??"",a.dataset.targetId??null)};return i.addEventListener("click",N),D(),{root:i,host:e,styleElement:r,dispose:()=>{i.removeEventListener("click",N),i.remove(),r.remove()}}}function re(e){if("fixture"in e&&e.fixture==="garden")return H();if("experience"in e&&e.experience)return e.experience;throw new Error('Embed.mount requires either { fixture: "garden" } or { experience: PriorityJourneyRun }')}function ie(e){var t;if(!((t=e.confirmation)!=null&&t.presentationPayload))throw new Error("Embed.mount experience requires confirmation.presentationPayload");if(!e.interpretation||!e.experience)throw new Error("Embed.mount experience requires interpretation and experience artifacts");if(!e.houseMapping||!e.followUps||e.followUps.length===0)throw new Error("Embed.mount experience requires houseMapping and at least one followUp");return[{type:"priority.selection.changed",selection:e.selection},{type:"priority.confirmation.accepted",presentationPayload:e.confirmation.presentationPayload},{type:"priority.transition.completed",transitionMessage:e.transitionMessage??void 0},{type:"priority.interpretation.ready",interpretation:e.interpretation,experience:e.experience},{type:"priority.mapping.ready",houseMapping:e.houseMapping,followUps:e.followUps}]}function ae(e,t){return"fixture"in e&&e.fixture==="garden"?G().filter(o=>o.type!=="priority.followup.selected"):ie(t)}let M=null;function v(){return M}function T(e){M=e}function se(e){var t;return e===void 0?((t=v())==null?void 0:t.host)??null:typeof e=="string"?document.querySelector(e):e}function S(e){const t=v();if(!t)return;const o=se(e);o&&o!==t.host||(t.dispose(),T(null))}function ce(e){if(typeof e!="string")return e;const t=document.querySelector(e);if(!t)throw new Error(`Embed.mount: target not found: ${e}`);return t}function de(e){v()&&S();const t=ce(e.target),o=re(e),r=ae(e,o),i=ne(t,o,r);T(i)}return{mount:de,unmount:S,version:"0.1.0"}})();
//# sourceMappingURL=embed.iife.js.map
