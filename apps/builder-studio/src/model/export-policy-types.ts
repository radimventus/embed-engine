/**
 * Export Policy Registry (EPIC-BLD-69)
 * Pure metadata registry for policy rules that describe when an export
 * is eligible to exist. The registry does not execute or enforce export logic.
 */

export type ExportPolicyStatus = 'Active' | 'Deprecated' | 'Removed';

export type ExportPolicy = {
  readonly id: string;
  readonly name: string;
  readonly conditions: readonly string[];
  readonly status: ExportPolicyStatus;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type ExportPolicyValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExportPolicyValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExportPolicyValidationIssue[];
  readonly validatedAt: string;
};

export type ExportPolicyPackage = {
  readonly id: string;
  readonly version: string;
  readonly policies: readonly ExportPolicy[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: ExportPolicyValidation | null;
};

export type RegisterExportPolicyInput = {
  readonly name: string;
  readonly conditions: readonly string[];
  readonly title?: string;
  readonly notes?: string;
  readonly status?: ExportPolicyStatus;
};

export type InitializeExportPolicyRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly policy?: RegisterExportPolicyInput;
};

export type ExportPolicyIndexEntry = {
  readonly packageId: string;
  readonly policyId: string;
  readonly name: string;
  readonly conditions: readonly string[];
  readonly status: ExportPolicyStatus;
};

export type ExportPolicyEventType =
  | 'ExportPolicyRegistered'
  | 'ExportPolicyValidated'
  | 'ExportPolicyDeprecated'
  | 'ExportPolicyRemoved';

export type ExportPolicyEvent = {
  readonly eventId: string;
  readonly type: ExportPolicyEventType;
  readonly packageId: string;
  readonly policyId: string | null;
  readonly at: string;
  readonly message: string;
};

