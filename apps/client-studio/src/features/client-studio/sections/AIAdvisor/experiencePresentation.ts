import type { Experience } from '@embed-engine/core/experience';

export type ExperienceFaqItem = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

/**
 * FAQ topics projected from Experience evidence — no invented Q&A copy.
 */
export function faqItemsFromExperience(
  experience: Experience,
): readonly ExperienceFaqItem[] {
  return Object.freeze(
    experience.evidence.map((item) =>
      Object.freeze({
        id: item.id,
        question: item.title,
        answer: item.description,
      }),
    ),
  );
}

/**
 * Opening assistant line from Experience summary.
 */
export function advisorIntroFromExperience(experience: Experience): string {
  return experience.summary;
}
