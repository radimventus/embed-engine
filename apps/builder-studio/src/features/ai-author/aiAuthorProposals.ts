/**
 * EPIC-BX-10 — Deterministic proposal generators (architecture only — no LLM).
 * Proposals are derived from existing Builder / HP / Experience / Knowledge data.
 */

import type { ExperienceComposition } from '../experience-composer/experienceComposition';
import type { KnowledgeCategoryView } from '../knowledge-composer/knowledgeProjection';
import type { ReleaseNotesDraft } from '../release-center/releaseRecord';
import type { AiAuthorActionId } from './aiAuthorTypes';

export type HeroProposalPayload = {
  readonly field: 'title' | 'subtitle' | 'cta';
  readonly value: string;
};

export type FaqProposalPayload = {
  readonly items: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
  readonly mode: 'append-questions' | 'fill-answers';
};

export type KnowledgeFillPayload = {
  readonly categoryId: string;
  readonly categoryLabel: string;
  readonly suggestedFaq: {
    readonly question: string;
    readonly answer: string;
  };
};

export type MediaHeroPayload = {
  readonly path: string;
  readonly title: string;
  readonly alt: string;
};

export type MediaGalleryOrderPayload = {
  readonly orderedFiles: readonly string[];
};

export type MediaCaptionsPayload = {
  readonly captions: readonly {
    readonly key: string;
    readonly title: string;
    readonly alt: string;
  }[];
};

export type ExperienceOrderPayload = {
  readonly moduleIds: readonly string[];
};

export type ExperienceCtaPayload = {
  readonly heroCta: string;
  readonly leadCta: string;
};

export type ReleaseNotesPayload = ReleaseNotesDraft;

export type ProposalResult = {
  readonly actionId: AiAuthorActionId;
  readonly label: string;
  readonly inputSummary: string;
  readonly contextSummary: string;
  readonly proposalText: string;
  readonly payload: unknown;
};

export function proposeHeroHeadline(input: {
  readonly projectName: string;
  readonly currentTitle: string;
}): ProposalResult {
  const value = `${input.projectName}: jasné rozhodnutí o domově`;
  return {
    actionId: 'hero-headline',
    label: 'Navrhnout headline',
    inputSummary: input.currentTitle || '(prázdný nadpis)',
    contextSummary: `Projekt ${input.projectName}`,
    proposalText: value,
    payload: { field: 'title', value } satisfies HeroProposalPayload,
  };
}

export function proposeHeroSubtitle(input: {
  readonly projectName: string;
  readonly roomCount: number;
}): ProposalResult {
  const value =
    input.roomCount > 0
      ? `Prohlédněte ${input.roomCount} místností a srovnejte priority před rozhodnutím.`
      : `Decision Experience vám pomůže ujasnit priority u projektu ${input.projectName}.`;
  return {
    actionId: 'hero-subtitle',
    label: 'Navrhnout subtitle',
    inputSummary: `rooms=${input.roomCount}`,
    contextSummary: input.projectName,
    proposalText: value,
    payload: { field: 'subtitle', value } satisfies HeroProposalPayload,
  };
}

export function proposeHeroCta(): ProposalResult {
  const value = 'Začít rozhodování';
  return {
    actionId: 'hero-cta',
    label: 'Navrhnout CTA',
    inputSummary: 'Hero CTA',
    contextSummary: 'Experience Hero',
    proposalText: value,
    payload: { field: 'cta', value } satisfies HeroProposalPayload,
  };
}

export function proposeKnowledgeFill(
  category: KnowledgeCategoryView,
): ProposalResult {
  const answer =
    category.fields.length > 0
      ? category.fields
          .slice(0, 3)
          .map((field) => `${field.label}: ${field.value}`)
          .join('. ')
      : `${category.label} zatím nemá vyplněná pole — doplňte zdrojová data.`;
  const question = `Co je důležité vědět o oblasti ${category.label}?`;
  return {
    actionId: 'knowledge-fill',
    label: 'Doplnit',
    inputSummary: category.label,
    contextSummary: `Health ${category.health} · ${category.itemCount} položek`,
    proposalText: `${question}\n→ ${answer}`,
    payload: {
      categoryId: category.id,
      categoryLabel: category.label,
      suggestedFaq: { question, answer },
    } satisfies KnowledgeFillPayload,
  };
}

export function proposeFaqQuestions(input: {
  readonly existing: readonly { readonly question: string; readonly answer: string }[];
  readonly projectName: string;
}): ProposalResult {
  const existingQ = new Set(
    input.existing.map((item) => item.question.trim().toLowerCase()),
  );
  const candidates = [
    {
      question: 'Jaké jsou provozní náklady domu?',
      answer: '',
    },
    {
      question: 'Jak probíhá rozhodování v Experience?',
      answer: '',
    },
    {
      question: `Čím se ${input.projectName} liší od běžné nabídky?`,
      answer: '',
    },
  ].filter((item) => !existingQ.has(item.question.toLowerCase()));

  return {
    actionId: 'faq-questions',
    label: 'Navrhnout další otázky',
    inputSummary: `${input.existing.length} FAQ`,
    contextSummary: input.projectName,
    proposalText: candidates.map((item) => `• ${item.question}`).join('\n'),
    payload: {
      items: candidates,
      mode: 'append-questions',
    } satisfies FaqProposalPayload,
  };
}

export function proposeFaqAnswers(input: {
  readonly existing: readonly { readonly question: string; readonly answer: string }[];
}): ProposalResult {
  const filled = input.existing.map((item) => {
    if (item.answer.trim().length > 0) {
      return item;
    }
    return {
      question: item.question,
      answer: `Stručná odpověď k „${item.question}“ — vychází z Knowledge a Experience projektu. Doplňte konkrétní údaje před publikací.`,
    };
  });
  return {
    actionId: 'faq-answers',
    label: 'Navrhnout odpovědi',
    inputSummary: `${input.existing.filter((item) => item.answer.trim().length === 0).length} prázdných odpovědí`,
    contextSummary: 'FAQ Author',
    proposalText: filled
      .filter((_item, index) => input.existing[index]?.answer.trim().length === 0)
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join('\n\n'),
    payload: {
      items: filled,
      mode: 'fill-answers',
    } satisfies FaqProposalPayload,
  };
}

export function proposeMediaHero(input: {
  readonly galleryFiles: readonly { readonly path: string; readonly room: string }[];
  readonly currentHero: string;
}): ProposalResult {
  const exterior =
    input.galleryFiles.find((item) =>
      item.room.toLowerCase().includes('exterior'),
    ) ?? input.galleryFiles[0];
  const path = exterior?.path || input.currentHero || 'media/hero/hero.webp';
  const title = 'Hlavní pohled na objekt';
  const alt = exterior
    ? `Hero — ${exterior.room || 'objekt'}`
    : 'Hero vizuál objektu';
  return {
    actionId: 'media-hero',
    label: 'Doporučit Hero',
    inputSummary: input.currentHero || '(bez hero)',
    contextSummary: `${input.galleryFiles.length} gallery`,
    proposalText: `${path}\n${title} / ${alt}`,
    payload: { path, title, alt } satisfies MediaHeroPayload,
  };
}

export function proposeGalleryOrder(input: {
  readonly files: readonly { readonly file: string; readonly room: string }[];
}): ProposalResult {
  const exterior = input.files.filter((item) =>
    item.room.toLowerCase().includes('exterior'),
  );
  const rest = input.files.filter(
    (item) => !item.room.toLowerCase().includes('exterior'),
  );
  const ordered = [...exterior, ...rest].map((item) => item.file);
  return {
    actionId: 'media-gallery-order',
    label: 'Doporučit pořadí galerie',
    inputSummary: `${input.files.length} snímků`,
    contextSummary: 'Exteriér první',
    proposalText: ordered.join(' → '),
    payload: { orderedFiles: ordered } satisfies MediaGalleryOrderPayload,
  };
}

export function proposeMediaCaptions(input: {
  readonly items: readonly {
    readonly key: string;
    readonly file: string;
    readonly room: string;
  }[];
}): ProposalResult {
  const captions = input.items.map((item) => ({
    key: item.key,
    title: item.room
      ? `${item.room.charAt(0).toUpperCase()}${item.room.slice(1)}`
      : item.file,
    alt: item.room
      ? `Fotografie — ${item.room}`
      : `Fotografie ${item.file}`,
  }));
  return {
    actionId: 'media-captions',
    label: 'Doporučit titulky',
    inputSummary: `${input.items.length} položek`,
    contextSummary: 'Media titles / ALT',
    proposalText: captions
      .map((item) => `${item.title} (${item.alt})`)
      .join('\n'),
    payload: { captions } satisfies MediaCaptionsPayload,
  };
}

export function proposeExperienceModuleOrder(
  composition: ExperienceComposition,
): ProposalResult {
  const preferred = [
    'hero',
    'priority',
    'house-navigator',
    'faq',
    'ai-advisor',
    'lead-capture',
  ] as const;
  const enabled = new Set(
    composition.modules.filter((module) => module.enabled).map((m) => m.id),
  );
  const moduleIds = preferred.filter((id) => enabled.has(id));
  for (const module of composition.modules) {
    if (module.enabled && !moduleIds.includes(module.id)) {
      moduleIds.push(module.id);
    }
  }
  return {
    actionId: 'experience-module-order',
    label: 'Navrhni lepší pořadí modulů',
    inputSummary: composition.modules.map((m) => m.id).join(' → '),
    contextSummary: 'Decision Flow baseline',
    proposalText: moduleIds.join(' → '),
    payload: { moduleIds } satisfies ExperienceOrderPayload,
  };
}

export function proposeExperienceCta(
  composition: ExperienceComposition,
): ProposalResult {
  const heroCta = 'Prohlédnout priority';
  const leadCta = composition.configs['lead-capture'].cta.trim() || 'Zanechat kontakt';
  return {
    actionId: 'experience-cta',
    label: 'Navrhni CTA',
    inputSummary: composition.configs.hero.cta,
    contextSummary: 'Hero + Lead',
    proposalText: `Hero: ${heroCta}\nLead: ${leadCta}`,
    payload: { heroCta, leadCta } satisfies ExperienceCtaPayload,
  };
}

export function proposeDecisionFlow(
  composition: ExperienceComposition,
): ProposalResult {
  const result = proposeExperienceModuleOrder(composition);
  return {
    ...result,
    actionId: 'experience-decision-flow',
    label: 'Navrhni lepší Decision Flow',
    contextSummary: 'Hero → Priority → Navigator → FAQ → Lead',
  };
}

export function proposeReleaseNotes(input: {
  readonly projectName: string;
  readonly preparedChanges: readonly string[];
  readonly heroPath: string;
}): ProposalResult {
  const changed =
    input.preparedChanges.length > 0
      ? input.preparedChanges.join('; ')
      : `Aktualizace Experience a obsahu projektu ${input.projectName}`;
  const why =
    'Sjednocení Decision Experience před publikací a zlepšení připravenosti.';
  const internal = input.heroPath
    ? `Hero: ${input.heroPath}`
    : 'Bez změny Hero v tomto draftu.';
  return {
    actionId: 'release-notes',
    label: 'Vytvořit Release Notes',
    inputSummary: input.projectName,
    contextSummary: `${input.preparedChanges.length} připravených změn`,
    proposalText: `Změny: ${changed}\nProč: ${why}\nInterní: ${internal}`,
    payload: {
      changed,
      why,
      internal,
      updatedAt: new Date().toISOString(),
    } satisfies ReleaseNotesPayload,
  };
}
