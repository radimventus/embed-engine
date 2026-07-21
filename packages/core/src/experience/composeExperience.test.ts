import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  composeExperience,
  createExperienceComposer,
  createExperienceFromInterpretation,
  type ExperienceComposeInput,
} from "./composeExperience";
import { interpretObject } from "../interpretation/interpretObject";
import { interpretationEngine } from "../interpretation/InterpretationEngine";

const OBJECT = Object.freeze({ id: "house-modern-01" });

function inputWith(
  selected: ExperienceComposeInput["priorities"]["selected"],
): ExperienceComposeInput {
  return {
    object: OBJECT,
    priorities: Object.freeze({ selected: Object.freeze([...selected]) }),
  };
}

describe("composeExperience", () => {
  it("returns a valid Experience", () => {
    const experience = composeExperience(inputWith([]));

    assert.equal(typeof experience.id, "string");
    assert.ok(experience.id.length > 0);
    assert.equal(typeof experience.title, "string");
    assert.equal(typeof experience.summary, "string");
    assert.ok(Array.isArray(experience.focus));
    assert.ok(experience.focus.length > 0);
    assert.ok(Array.isArray(experience.recommendations));
    assert.ok(Array.isArray(experience.evidence));
    assert.ok(experience.evidence.length >= 2);
    assert.ok(Array.isArray(experience.concerns));
    assert.ok(experience.concerns.length >= 1);
    assert.ok(experience.confidence);
    assert.ok(["low", "medium", "high"].includes(experience.confidence.level));
    assert.ok(Number.isInteger(experience.confidence.score));
    assert.ok(experience.confidence.score >= 0);
    assert.ok(experience.confidence.score <= 100);
    assert.ok(Array.isArray(experience.actions));
    assert.ok(experience.actions.length >= 2);
  });

  it("is deterministic for the same input", () => {
    const input = inputWith(["layout"]);
    assert.deepEqual(composeExperience(input), composeExperience(input));
  });

  it("createExperienceComposer returns the same shape", () => {
    const composer = createExperienceComposer();
    const input = inputWith([]);
    assert.deepEqual(composer(input), composeExperience(input));
  });

  it("keeps object identity in Experience id without changing Object", () => {
    const experience = composeExperience(inputWith(["design"]));
    assert.match(experience.id, /^experience\.house-modern-01\./);
  });
});

describe("first interpretation", () => {
  it("produces different Experiences for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    assert.notEqual(family.title, investment.title);
    assert.notEqual(family.summary, design.summary);
    assert.notDeepEqual(family.focus, sustainability.focus);
    assert.notDeepEqual(investment.recommendations, design.recommendations);
    assert.notDeepEqual(family.evidence, investment.evidence);
    assert.notDeepEqual(family.concerns, investment.concerns);
    assert.notDeepEqual(family.confidence, investment.confidence);

    assert.equal(family.title, "Interpretace pro rodinné bydlení");
    assert.equal(investment.title, "Investiční interpretace");
    assert.equal(design.title, "Designová interpretace");
    assert.equal(sustainability.title, "Udržitelnostní interpretace");
  });

  it("resolves mapped priority by deterministic precedence", () => {
    const experience = composeExperience(
      inputWith(["energy", "layout", "design"]),
    );
    assert.equal(experience.title, "Interpretace pro rodinné bydlení");
  });
});

describe("experience evidence", () => {
  it("produces different Evidence for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    for (const experience of [family, investment, design, sustainability]) {
      assert.ok(experience.evidence.length >= 2);
      assert.ok(experience.evidence.length <= 4);
      for (const item of experience.evidence) {
        assert.equal(typeof item.id, "string");
        assert.equal(typeof item.title, "string");
        assert.equal(typeof item.description, "string");
      }
    }

    assert.equal(family.evidence[0]?.title, "Čtyři ložnice");
    assert.equal(investment.evidence[0]?.title, "Nízké provozní náklady");
    assert.equal(design.evidence[0]?.title, "Prémiové materiály");
    assert.equal(sustainability.evidence[0]?.title, "Energeticky účinná obálka");
    assert.notDeepEqual(family.evidence, design.evidence);
  });
});

describe("experience concerns", () => {
  it("produces different Concerns for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    for (const experience of [family, investment, design, sustainability]) {
      assert.ok(experience.concerns.length >= 1);
      assert.ok(experience.concerns.length <= 3);
      for (const item of experience.concerns) {
        assert.equal(typeof item.id, "string");
        assert.equal(typeof item.title, "string");
        assert.equal(typeof item.description, "string");
        assert.ok(["low", "medium", "high"].includes(item.severity));
      }
    }

    assert.equal(family.concerns[0]?.title, "Dětský pokoj v patře");
    assert.equal(investment.concerns[0]?.title, "Vyšší kupní cena");
    assert.equal(design.concerns[0]?.title, "Minimální úložné prostory");
    assert.equal(
      sustainability.concerns[0]?.title,
      "Solární instalace není součástí",
    );
    assert.notDeepEqual(family.concerns, design.concerns);
  });
});

describe("experience confidence", () => {
  it("produces different Confidence for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    assert.deepEqual(family.confidence, {
      level: "high",
      score: 92,
      explanation: "Objekt silně odpovídá vybraným prioritám.",
    });
    assert.deepEqual(investment.confidence, {
      level: "medium",
      score: 76,
      explanation: "Většina investičních indikátorů je pozitivní.",
    });
    assert.deepEqual(design.confidence, {
      level: "high",
      score: 88,
      explanation:
        "Architektonická kvalita konzistentně podporuje tuto interpretaci.",
    });
    assert.deepEqual(sustainability.confidence, {
      level: "medium",
      score: 71,
      explanation: "Energetické prvky jsou přítomné, ale ne kompletní.",
    });
    assert.notDeepEqual(family.confidence, design.confidence);
  });
});

describe("experience fragments", () => {
  it("assembles the same Experience fields via fragment composition", () => {
    const family = composeExperience(inputWith(["layout"]));
    assert.equal(family.id, "experience.house-modern-01.family");
    assert.equal(family.title, "Interpretace pro rodinné bydlení");
    assert.equal(family.evidence[0]?.title, "Čtyři ložnice");
    assert.equal(family.concerns[0]?.title, "Dětský pokoj v patře");
    assert.equal(family.confidence.score, 92);
  });
});

describe("experience actions", () => {
  it("produces different Actions for different PrioritySelections", () => {
    const family = composeExperience(inputWith(["layout"]));
    const investment = composeExperience(inputWith(["investment"]));
    const design = composeExperience(inputWith(["design"]));
    const sustainability = composeExperience(inputWith(["energy"]));

    for (const experience of [family, investment, design, sustainability]) {
      assert.ok(experience.actions.length >= 2);
      assert.ok(experience.actions.length <= 3);
      for (const item of experience.actions) {
        assert.equal(typeof item.id, "string");
        assert.equal(typeof item.label, "string");
        assert.ok(["primary", "secondary"].includes(item.type));
        assert.ok(
          ["explore", "compare", "contact", "calculate"].includes(item.intent),
        );
      }
    }

    assert.equal(family.actions[0]?.label, "Naplánovat prohlídku");
    assert.equal(investment.actions[0]?.label, "Spočítat návratnost");
    assert.equal(design.actions[0]?.label, "Prohlédnout architektonickou galerii");
    assert.equal(sustainability.actions[0]?.label, "Projít energetické detaily");
    assert.notDeepEqual(family.actions, design.actions);
  });
});

describe("ADR-012 runtime pipeline", () => {
  it("routes Object → InterpretationEngine → Experience as the canonical path", () => {
    const input = inputWith(["layout"]);
    const interpretation = interpretationEngine.interpret({
      objectId: input.object.id,
      priorityIds: input.priorities.selected,
    });
    const viaInterpretation = createExperienceFromInterpretation(interpretation);
    const viaCompose = composeExperience(input);

    assert.equal(interpretation.objectId, "house-modern-01");
    assert.ok(interpretation.id.startsWith("interpretation."));
    assert.equal(interpretation.matchScore, 92);
    assert.ok(interpretation.trace);
    assert.deepEqual(viaInterpretation, viaCompose);
  });

  it("keeps Experience snapshots identical across lenses when routed through InterpretationEngine", () => {
    for (const selected of [
      [],
      ["layout"],
      ["investment"],
      ["design"],
      ["energy"],
      ["energy", "layout", "design"],
    ] as const) {
      const input = inputWith(selected);
      const interpretation = interpretationEngine.interpret({
        objectId: input.object.id,
        priorityIds: input.priorities.selected,
      });
      assert.deepEqual(
        createExperienceFromInterpretation(interpretation),
        composeExperience(input),
      );
      assert.deepEqual(
        interpretation,
        interpretObject({
          objectId: input.object.id,
          priorityIds: input.priorities.selected,
        }),
      );
      assert.ok(interpretation.trace);
    }
  });

  it("does not leak InterpretationTrace into Experience", () => {
    const experience = composeExperience(inputWith(["layout"]));
    assert.equal("trace" in experience, false);
  });
});
