export interface DecisionReportPreviewViewModel {
  propertyName: string;
  priorities: string[];
  summary: string;
  includedItems: string[];
}

export const MOCK_DECISION_REPORT_PREVIEW: DecisionReportPreviewViewModel = {
  propertyName: 'Modern Family House',
  priorities: ['Operating Costs', 'Privacy', 'Layout'],
  summary:
    'This property matches your decision priorities particularly well in operating efficiency, overall layout and privacy.',
  includedItems: [
    'Personalized recommendation',
    'Key strengths',
    'Considerations',
    'Property highlights',
    'Relevant documents',
    'QR link back to Client Studio',
  ],
};
