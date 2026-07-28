import type {
  DecisionExecution,
  DecisionExecutionIndexEntry,
} from '../../model';

/**
 * DecisionExecutionIndex (EPIC-BLD-31).
 */
export type DecisionExecutionIndex = {
  index(
    packageId: string,
    execution: DecisionExecution,
  ): DecisionExecutionIndexEntry;
  find(executionId: string): readonly DecisionExecutionIndexEntry[];
  list(packageId?: string): readonly DecisionExecutionIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly execution: DecisionExecution;
    }[],
  ): readonly DecisionExecutionIndexEntry[];
};

export function createDecisionExecutionIndex(): DecisionExecutionIndex {
  let entries: DecisionExecutionIndexEntry[] = [];

  return {
    index(packageId, execution) {
      const next: DecisionExecutionIndexEntry = {
        packageId,
        executionId: execution.id,
        sessionId: execution.sessionId,
        storyId: execution.storyId,
        state: execution.state,
        currentMove: execution.currentMove,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(executionId) {
      return entries.filter((item) => item.executionId === executionId);
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.packageId === packageId);
    },

    rebuild(packages) {
      entries = [];
      for (const item of packages) {
        this.index(item.id, item.execution);
      }
      return [...entries];
    },
  };
}
