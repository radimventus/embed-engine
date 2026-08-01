/**
 * EPIC-BX-03 — Experience Composer model (authoring metadata, not HP-002).
 * Module catalog mirrors production Decision Experience surfaces.
 */

export type ExperienceModuleId =
  | 'hero'
  | 'priority'
  | 'house-navigator'
  | 'faq'
  | 'ai-advisor'
  | 'lead-capture';

export type ExperienceModuleReadyState = 'ready' | 'warning' | 'error';

export type ExperienceModuleDefinition = {
  readonly id: ExperienceModuleId;
  readonly label: string;
  readonly description: string;
};

/** Canonical production Experience order (Click Model / DEB-01 baseline). */
export const EXPERIENCE_MODULE_CATALOG: readonly ExperienceModuleDefinition[] = [
  {
    id: 'hero',
    label: 'Hero',
    description: 'Úvod Experience — vizuál a CTA.',
  },
  {
    id: 'priority',
    label: 'Priority',
    description: 'Priority rozhodování.',
  },
  {
    id: 'house-navigator',
    label: 'House Navigator',
    description: 'Prohlídka dispozice a médií.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Časté otázky a odpovědi.',
  },
  {
    id: 'ai-advisor',
    label: 'AI Advisor',
    description: 'AI poradce v Decision Experience.',
  },
  {
    id: 'lead-capture',
    label: 'Lead Capture',
    description: 'Zachycení leadu a následná akce.',
  },
] as const;

export const DEFAULT_EXPERIENCE_MODULE_ORDER: readonly ExperienceModuleId[] =
  EXPERIENCE_MODULE_CATALOG.map((item) => item.id);

export type HeroModuleConfig = {
  readonly title: string;
  readonly subtitle: string;
  readonly cta: string;
  readonly imagePath: string;
};

export type PriorityModuleConfig = {
  readonly enabled: boolean;
  readonly priorityOrder: readonly string[];
  readonly intensities: Readonly<Record<string, number>>;
};

export type FaqModuleConfig = {
  readonly items: readonly { readonly question: string; readonly answer: string }[];
};

export type AiAdvisorModuleConfig = {
  readonly prompt: string;
  readonly tone: string;
};

export type LeadCaptureModuleConfig = {
  readonly formLabel: string;
  readonly cta: string;
  readonly nextAction: string;
};

export type HouseNavigatorModuleConfig = {
  readonly defaultRoomHint: string;
  readonly showFloorPlan: boolean;
};

export type ExperienceModuleConfigs = {
  readonly hero: HeroModuleConfig;
  readonly priority: PriorityModuleConfig;
  readonly 'house-navigator': HouseNavigatorModuleConfig;
  readonly faq: FaqModuleConfig;
  readonly 'ai-advisor': AiAdvisorModuleConfig;
  readonly 'lead-capture': LeadCaptureModuleConfig;
};

export type ExperienceModulePlacement = {
  readonly id: ExperienceModuleId;
  readonly enabled: boolean;
};

export type ExperienceComposition = {
  readonly projectId: string;
  readonly modules: readonly ExperienceModulePlacement[];
  readonly configs: ExperienceModuleConfigs;
  readonly revision: number;
  readonly updatedAt: string;
};

export const EXPERIENCE_COMPOSER_STORAGE_KEY =
  'conis.builder.experience-composer.v1' as const;

export function getModuleDefinition(
  id: ExperienceModuleId,
): ExperienceModuleDefinition {
  return (
    EXPERIENCE_MODULE_CATALOG.find((item) => item.id === id) ??
    EXPERIENCE_MODULE_CATALOG[0]
  );
}

export function createDefaultModuleConfigs(
  heroImagePath = 'media/hero/hero.webp',
): ExperienceModuleConfigs {
  return {
    hero: {
      title: 'Váš dům. Vaše rozhodnutí.',
      subtitle: 'Decision Experience pro jasnější volbu.',
      cta: 'Začít',
      imagePath: heroImagePath,
    },
    priority: {
      enabled: true,
      priorityOrder: ['family', 'layout', 'investment', 'design'],
      intensities: {
        family: 0.7,
        layout: 0.6,
        investment: 0.5,
        design: 0.4,
      },
    },
    'house-navigator': {
      defaultRoomHint: 'living-room',
      showFloorPlan: true,
    },
    faq: {
      items: [
        {
          question: 'Jak Experience pomáhá s rozhodováním?',
          answer:
            'Provede vás prioritami, prohlídkou a shrnutím před kontaktem.',
        },
        {
          question: 'Mohu se vrátit k prohlídce?',
          answer: 'Ano — House Navigator zůstává dostupný během session.',
        },
      ],
    },
    'ai-advisor': {
      prompt: 'Pomáhej klientovi ujasnit priority bez tlaku na uzavření.',
      tone: 'klidný, odborný, srozumitelný',
    },
    'lead-capture': {
      formLabel: 'Zanechte kontakt',
      cta: 'Odeslat',
      nextAction: 'mailto',
    },
  };
}

export function createDefaultExperienceComposition(
  projectId: string,
  heroImagePath?: string,
): ExperienceComposition {
  return {
    projectId,
    modules: DEFAULT_EXPERIENCE_MODULE_ORDER.map((id) => ({
      id,
      enabled: true,
    })),
    configs: createDefaultModuleConfigs(heroImagePath),
    revision: 1,
    updatedAt: new Date().toISOString(),
  };
}

export function reorderExperienceModules(
  composition: ExperienceComposition,
  fromIndex: number,
  toIndex: number,
): ExperienceComposition {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= composition.modules.length ||
    toIndex >= composition.modules.length
  ) {
    return composition;
  }
  const next = [...composition.modules];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return {
    ...composition,
    modules: next,
    revision: composition.revision + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function toggleExperienceModule(
  composition: ExperienceComposition,
  moduleId: ExperienceModuleId,
): ExperienceComposition {
  return {
    ...composition,
    modules: composition.modules.map((module) =>
      module.id === moduleId
        ? { ...module, enabled: !module.enabled }
        : module,
    ),
    revision: composition.revision + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function addExperienceModule(
  composition: ExperienceComposition,
  moduleId: ExperienceModuleId,
): ExperienceComposition {
  if (composition.modules.some((module) => module.id === moduleId)) {
    return {
      ...composition,
      modules: composition.modules.map((module) =>
        module.id === moduleId ? { ...module, enabled: true } : module,
      ),
      revision: composition.revision + 1,
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...composition,
    modules: [...composition.modules, { id: moduleId, enabled: true }],
    revision: composition.revision + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function updateModuleConfig<K extends ExperienceModuleId>(
  composition: ExperienceComposition,
  moduleId: K,
  config: ExperienceModuleConfigs[K],
): ExperienceComposition {
  return {
    ...composition,
    configs: {
      ...composition.configs,
      [moduleId]: config,
    },
    revision: composition.revision + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function summarizeModuleConfig(
  composition: ExperienceComposition,
  moduleId: ExperienceModuleId,
): string {
  const config = composition.configs[moduleId];
  switch (moduleId) {
    case 'hero': {
      const hero = config as HeroModuleConfig;
      return `${hero.title} · ${hero.cta}`;
    }
    case 'priority': {
      const priority = config as PriorityModuleConfig;
      return priority.enabled
        ? `${priority.priorityOrder.length} priorit`
        : 'Vypnuto';
    }
    case 'house-navigator': {
      const nav = config as HouseNavigatorModuleConfig;
      return nav.showFloorPlan
        ? `Půdorys · ${nav.defaultRoomHint}`
        : nav.defaultRoomHint;
    }
    case 'faq': {
      const faq = config as FaqModuleConfig;
      return `${faq.items.length} otázek`;
    }
    case 'ai-advisor': {
      const advisor = config as AiAdvisorModuleConfig;
      return advisor.tone;
    }
    case 'lead-capture': {
      const lead = config as LeadCaptureModuleConfig;
      return `${lead.cta} · ${lead.nextAction}`;
    }
  }
}

export type ExperienceComposerStore = {
  readonly byProjectId: Readonly<Record<string, ExperienceComposition>>;
};

export function emptyExperienceComposerStore(): ExperienceComposerStore {
  return { byProjectId: {} };
}
