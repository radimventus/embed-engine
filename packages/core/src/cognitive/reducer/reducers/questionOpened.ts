import type { DecisionState } from "../../decision-state/DecisionState";
import type { Signal } from "../../signals/Signal";
import { readPayloadString, withFocusPatch } from "./focus-patch";

const HOUSEHOLD_PROFILE_FACT_KEY = "household.profile";

function withHouseholdFact(
  state: DecisionState,
  householdProfile: string,
): DecisionState {
  const nextFacts = state.facts.filter(
    (fact) => fact.key !== HOUSEHOLD_PROFILE_FACT_KEY,
  );

  return Object.freeze({
    ...state,
    facts: Object.freeze([
      ...nextFacts,
      Object.freeze({
        id: HOUSEHOLD_PROFILE_FACT_KEY,
        key: HOUSEHOLD_PROFILE_FACT_KEY,
        value: householdProfile,
      }),
    ]),
  });
}

export function reduceQuestionOpened(
  state: DecisionState,
  signal: Signal,
): DecisionState {
  const questionId = readPayloadString(signal, "questionId");
  if (questionId === undefined) {
    return state;
  }

  const withFocus = withFocusPatch(state, { questionId });
  const householdProfile = readPayloadString(signal, "householdProfile");
  if (householdProfile === undefined) {
    return withFocus;
  }

  return withHouseholdFact(withFocus, householdProfile);
}
