import type { ReactExperienceModel } from '@embed-engine/model';

import { HouseDecisionExperience } from '../house-decision/HouseDecisionExperience';

type LegacyCommandExperienceProps = {
  experience: ReactExperienceModel | null;
  onSelectChoice: (decisionId: string, choiceId: string) => void;
  onContinue: () => void;
};

/**
 * LEGACY — CommandRuntime `ReactExperienceModel` path (quarantined).
 * Not part of the Cognitive Experience binding (RI-001 / RI-003).
 * Do not extend; do not feed Interpretation / Decision Session from here.
 */
export function LegacyCommandExperience({
  experience,
  onSelectChoice,
  onContinue,
}: LegacyCommandExperienceProps) {
  if (experience === null) {
    return null;
  }

  return (
    <>
      <div
        data-legacy-experience="command-runtime"
        data-testid="legacy-command-experience"
      >
        <HouseDecisionExperience
          experience={experience}
          onSelectChoice={onSelectChoice}
          onContinue={onContinue}
        />
      </div>
      <div
        aria-hidden="true"
        className="h-chapter-spacing w-full shrink-0 bg-[#F7F6F4]"
      />
    </>
  );
}
