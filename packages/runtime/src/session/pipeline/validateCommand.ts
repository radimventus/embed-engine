import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionSession } from "../DecisionSession";
import type { RuntimeCommand } from "./RuntimeCommand";

export type PipelineErrorCode =
  | "HP_OBJECT_MISMATCH"
  | "HP_UNKNOWN_ROOM"
  | "HP_INVALID_PRIORITY"
  | "HP_INVALID_VARIANT"
  | "HP_INVALID_SCENARIO"
  | "HP_INVALID_ANSWER"
  | "HP_UNKNOWN_COMMAND"
  | "HP_PROJECTION_FAILED"
  | "HP_INTERPRETATION_FAILED";

export type PipelineError = {
  readonly code: PipelineErrorCode;
  readonly message: string;
  readonly path?: string;
};

export type ValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly errors: readonly PipelineError[] };

/**
 * Validate command intent against Object Package + session invariants.
 * MUST NOT mutate Runtime. Interpretation MUST NOT perform this step.
 */
export function validateCommand(input: {
  readonly session: DecisionSession;
  readonly housePackage: HousePackage;
  readonly command: RuntimeCommand;
}): ValidationResult {
  const { session, housePackage, command } = input;
  const errors: PipelineError[] = [];

  if (housePackage.identity.id !== session.objectId) {
    errors.push({
      code: "HP_OBJECT_MISMATCH",
      message: `HousePackage id "${housePackage.identity.id}" does not match session objectId "${session.objectId}".`,
      path: "housePackage.identity.id",
    });
    return { ok: false, errors };
  }

  switch (command.type) {
    case "SelectRoom": {
      if (typeof command.roomId !== "string" || command.roomId.length === 0) {
        errors.push({
          code: "HP_UNKNOWN_ROOM",
          message: "roomId must be a non-empty string.",
          path: "command.roomId",
        });
        break;
      }
      const room = housePackage.rooms.find((candidate) => candidate.id === command.roomId);
      if (room === undefined) {
        errors.push({
          code: "HP_UNKNOWN_ROOM",
          message: `RoomId "${command.roomId}" is not in the Object Package Room Registry.`,
          path: "command.roomId",
        });
      }
      break;
    }
    case "ChangePriority": {
      if (!Array.isArray(command.priorityIds) || command.priorityIds.length === 0) {
        errors.push({
          code: "HP_INVALID_PRIORITY",
          message: "priorityIds must be a non-empty array.",
          path: "command.priorityIds",
        });
        break;
      }
      if (command.priorityIds.some((id) => typeof id !== "string" || id.length === 0)) {
        errors.push({
          code: "HP_INVALID_PRIORITY",
          message: "Each priorityId must be a non-empty string.",
          path: "command.priorityIds",
        });
      }
      const unique = new Set(command.priorityIds);
      if (unique.size !== command.priorityIds.length) {
        errors.push({
          code: "HP_INVALID_PRIORITY",
          message: "priorityIds must be unique.",
          path: "command.priorityIds",
        });
      }
      if (command.intensities !== undefined) {
        if (
          !Array.isArray(command.intensities) ||
          command.intensities.length !== command.priorityIds.length
        ) {
          errors.push({
            code: "HP_INVALID_PRIORITY",
            message: "intensities must match priorityIds one-for-one.",
            path: "command.intensities",
          });
          break;
        }
        const intensityIds = command.intensities.map((item) => item.priorityId);
        const intensitySet = new Set(intensityIds);
        if (
          intensitySet.size !== intensityIds.length ||
          command.priorityIds.some((id) => !intensitySet.has(id)) ||
          command.intensities.some(
            (item) =>
              typeof item.priorityId !== "string" ||
              item.priorityId.length === 0 ||
              typeof item.importance !== "number" ||
              !Number.isFinite(item.importance) ||
              item.importance < 0 ||
              item.importance > 1,
          )
        ) {
          errors.push({
            code: "HP_INVALID_PRIORITY",
            message:
              "Each intensity must use the Client 0–1 importance scale for a selected priorityId.",
            path: "command.intensities",
          });
        }
      }
      break;
    }
    case "SelectVariant": {
      if (typeof command.variantId !== "string" || command.variantId.length === 0) {
        errors.push({
          code: "HP_INVALID_VARIANT",
          message: "variantId must be a non-empty string.",
          path: "command.variantId",
        });
      }
      break;
    }
    case "ActivateScenario": {
      if (typeof command.scenarioId !== "string" || command.scenarioId.length === 0) {
        errors.push({
          code: "HP_INVALID_SCENARIO",
          message: "scenarioId must be a non-empty string.",
          path: "command.scenarioId",
        });
      }
      break;
    }
    case "AnswerQuestion": {
      if (typeof command.questionId !== "string" || command.questionId.length === 0) {
        errors.push({
          code: "HP_INVALID_ANSWER",
          message: "questionId must be a non-empty string.",
          path: "command.questionId",
        });
      }
      if (typeof command.answerId !== "string" || command.answerId.length === 0) {
        errors.push({
          code: "HP_INVALID_ANSWER",
          message: "answerId must be a non-empty string.",
          path: "command.answerId",
        });
      }
      break;
    }
    default: {
      const _exhaustive: never = command;
      errors.push({
        code: "HP_UNKNOWN_COMMAND",
        message: `Unsupported command: ${JSON.stringify(_exhaustive)}`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true };
}
